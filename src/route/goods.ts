import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import BodyParser from "body-parser";

const ajv = new Ajv();
let i:number=0;
const goodsRoute = Router();
//keyword nickname role status num//关键词 别名 用途 状态 |||现有数量

//页面加载时返回物品数据
goodsRoute.get("/", async (req, res) => {
  try {
    const result = await db.goods.findMany({
      include: {
        status: {
          include: {
            place: true,
            borrow: true,
          },
        },
      },
    });
    res.send(result)   //跟lyq学长讨论前端所需要的数据
  } catch (err){
    console.log(JSON.stringify(err));
        res.status(500).send({
          err: "Failed to find goods.",
        });
  }
})
//物品数据增加||||personID,staff,ItemID，position，keyword，nickname，role，status，num
.use(BodyParser.json()).post("/", async (req, res) => {//可以在路径里写正则表达式
  type Params = {
    amount:number;
    name: string;
    category: string[];
    tags: string[];
    place:string;
    memberID:string;
  };
  const schema: JSONSchemaType<Params> = {
    type: "object",
    properties: {
      amount:{
        type:"integer"
      },
      name: {
        type: "string",
        minLength: 2,
      },
      category: {
        type: "array",
        items:{
          type:"string"
        }
      },
      tags: {
        type: "array",
        items:{
          type:"string"
        }
      },
      place:{
        type:"string",
      },
      memberID:{
        type:"string",
      },
    },
    required: ["name", "category", "tags","place","memberID"],
  };
  const validator = ajv.compile(schema);
  if (validator(req.body)) {
    try {
      while(i<req.body.amount){
      const placement =await db.placement.create({
        data:{
          place:req.body.place,
          at:new Date(),
          member:{
            connect:{
              schoolId:req.body.memberID
            }
          },
          status:{
           create:{
            goods:{
              create:{
                name:req.body.name,
                category:req.body.category,
                tags:req.body.tags,
              }
            }
           } 
          }
        }
      });
      i=i+1;
    } 
      // const placement = await db.member.findUnique({
      //   where:{
      //     schoolId:req.body.memberID
      //   }
      // })
      res.send({
        message:"All right"
      });
    } catch (err) {
      console.log(JSON.stringify(err));
      res.status(500).send({
        err: "Failed to create goods.",
      });
    }
}else {
    res.status(400).send({
      err: "Invalid find data.",
    });
  }

})
///删除问题

.put("/:id", async (req, res) => {
  const id = req.params.id;
    try {
      
      const result = await db.goods.update({
        where: {
          id:parseInt(id,10),
        },
        data: {
          deleted: true,
        },
      });
      res.send({
        message: "deleted",
      });
    } catch (err) {
      res.status(500).send({
        err: "Failed to deleted.",
      });
    }

})

export default goodsRoute;






