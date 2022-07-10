import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import  BodyParser  from "body-parser";

const ajv = new Ajv();
const searchRoute = Router();

searchRoute
    .use(BodyParser.json())
    .get("/",async (req, res) => {
        type CreateSearch = { 
            name: string,
        };
        const schema: JSONSchemaType<CreateSearch> ={
            type: "object",
            properties: {
                name: {
                    type: "string",
                },
            },
            required: ["name"]
        };
        const validator = ajv.compile(schema);
        if(validator(req.body)){
            try{
                const ser = await db.goods.findMany({
                    where:{ 
                        name:req.body.name,
                    },
                        include: {
                            status:{
                                include:{
                                    place: true,
                                    borrow: {
                                        select:{
                                            returned: true,
                                        },
                                    },
                                },
                            },
                        },
                });
                res.send(ser)
            }catch(err) {
                console.log(JSON.stringify(err));
                res.status(500).send({
                    err: "Failed to search.",
                });
            }
        } else{
            res.status(400).send({
                err: "Invalid input data.",
            });
        }
    })

    
export default searchRoute;
