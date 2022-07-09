# API设计

## 物品(Goods)

### 增

POST /api/goods/

输入参考

```jsonc
{
    // 物品数量
    "amount": 1,
    "name": "板凳",
    "category": ["非消耗品","桌椅"],
    "tags": ["椅子"],
    "place": "办公室东南角",
    "memberId": "2021200903",    
}
```

create Placement -> Status -> Goods

###  查

GET /api/goods/:id

findUnique Goods include Status include {Borrow Placement}

### 改

不设计

### 删

DELETE /api/goods/:id

update where id set deleted true

## 借出(Borrow)

###  查

GET /api/borrow/:id

### 增

POST /api/borrow

```jsonc
{
    "goodsIds": [1,2,3],
    "wishToReturn": 1657371041467,
    "memberId": "2021200903",
    "personId": "2021200902",
    "description": "开例会",
}
```

对每一个goodsId创建一个Borrow -> Status -根据id连接（connect）到一个物品-> Goods

```ts
db.borrow.create({
  data: {
    wishToReturn: new Date(1657371041467),
    memberId: "2021200903",
    personId: "2021200902",
    description: "开例会",
    status: {
        create: {
            goods: {
                connect: {
                    id: 1
                }
            }
        }
    }
  },
});
```

### 改

PUT /api/borrow/:borrowId/:memberId

```ts
// 归还
const result = await db.borrow.update({
    where: {
        id: id
    },
    data: {
        returned: new Date()
    },
    include: {
        status: {
            include: {
                goods: {
                    select: {
                        id: true
                    }
                }
            }
        }
    }
});
// 重新放置
db.placement.create({
    data: {
        place: "办公室东南角",
        at: new Date(),
        member: {
            connect: {
                schoolId: memberId
            }
        },
        status: {
            create: {
                goods: {
                    connect: {
                        id: result.status.goods.id
                    }
                }
            }
        }
    }
});
```

## 放置(Placement)

### 查

GET /api/placement/:id

### 增

POST /api/placement

```jsonc
{
    "goodsIds": [3,4,5],
    "palce": "办公室西南角",
    "memberId": "2021200903",
}
```

根据goodsIds，创建多个新的状态并联系到物品上

## Person | Member

### 增

POST /api/person/:name/:schoolId/:tel

POST /api/member/:name/:schoolId/:department/:tel

### 改

PUT /api/person/:schoolId/tel/:newTel

PUT /api/member/:schoolId/tel/:newTel


## 高级API

### 查询某个物品的详细历史

GET /api/goods/:id/history

### 根据外部人员信息查询个人借用历史

GET /api/person/:schoolId/history

### 根据内部人员学号查询登记历史

GET /api/member/:schoolId/history

### 搜索

GET /api/search?keywords=keyword1&keywords=keyword2

req.query.keyrwords = [keyword1, keword2]