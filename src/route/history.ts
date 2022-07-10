import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import  BodyParser  from "body-parser";

const ajv = new Ajv();

const historyRoute = Router();

historyRoute
    .use(BodyParser.json())
    .get("/", async (req, res) => {
        type CreateHistory = {
            id:number,
        };
        const schema: JSONSchemaType<CreateHistory> ={
            type: "object",
            properties: {
                id: {
                    type: "integer",
                }
            },
            required: ["id"]
        };
        const validator = ajv.compile(schema)
        if(validator(req.body)){
            try{
                const hisroty = await db.borrow.findMany({
                    where: {
                        id: req.body.id
                    },
                });
                res.send(hisroty)
            }catch (err) {
                console.log(JSON.stringify(err));
                res.status(500).send({
                    err: "Failed to search hisroty.",
                });
            }
        } else{
            res.status(400).send({
                err: "Invalid input data.",
            });
        }
    });
    export default historyRoute;