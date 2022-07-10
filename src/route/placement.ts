import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import BodyParser from "body-parser";

const ajv = new Ajv();

const placementRoute = Router();
placementRoute
.use(BodyParser.json()).post("/", async (req, res) => {//可以在路径里写正则表达式
  type Params = {
    "goodsIds":number[];
    "placement":string;
    "memberId":string;
  };
  const schema: JSONSchemaType<Params> = {
    type: "object",
    properties: {
      goodsIds: {
        type: "array",
        items:{
            type:"integer",
        }
    
      },
      placement: {
        type: "string",
      },
      memberId: {
          type:"string",
        }
      },
    required: ["goodsIds","memberId","placement"],
  };
  const validator = ajv.compile(schema);
  if (validator(req.body)) {
    try {
        for(const id of req.body.goodsIds)
        {
            await db.placement.create({
                data:{place:req.body.placement,
                      at:new Date(),
                    member:{
                        connect:{schoolId:req.body.memberId}
                    },
                   status:{
                    create:{
                        goods:{connect:{
                            id:id
                        }}
                    }
                   }}
            })
        }
    //   const result = await db.placement.create({
    //     data: {...req.body},
    //   });
      res.send({
        message: "all right",
      });
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

export default placementRoute;






