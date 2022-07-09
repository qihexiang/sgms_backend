import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import BodyParser from "body-parser";

const ajv = new Ajv();

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
    name: string;
    category: string[];
    tags: string[];
  };
  const schema: JSONSchemaType<Params> = {
    type: "object",
    properties: {
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
    },
    required: ["name", "category", "tags"],
  };
  const validator = ajv.compile(schema);
  if (validator(req.body)) {
    try {
      const result = await db.goods.create({
        data: {...req.body},
      });
      res.send(result);
    } catch (err) {
      console.log(JSON.stringify(err));
      res.status(500).send({
        err: "Failed to find goods.",
      });
    }
  } else {
    res.status(400).send({
      err: "Invalid find data.",
    });
  }
})

export default goodsRoute;






