import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";
import  BodyParser  from "body-parser";

const ajv = new Ajv();
const borrowRoute = Router();
borrowRoute
    .use(BodyParser.json())
    .post("/",async (req, res) => {
        type CreateBorrow = {
            wishToReturn: number
            memberId: string
            personId: string
            description: string
            statusId: number
        };
        const schema: JSONSchemaType<CreateBorrow> = {
            type: "object",
            properties: {
                wishToReturn:{
                    type: "integer",
                },
                memberId:{
                    type:"string",
                    minLength: 10,
                    maxLength: 10,
                },
                personId:{
                    type:"string",
                    minLength: 10,
                    maxLength: 10,
                },
                description:{
                    type:"string",
                },
                statusId:{
                    type:"integer",
                }
            },
             required: ["wishToReturn","memberId","personId","description","statusId"], 
        };
        const validator = ajv.compile(schema);
        if (validator(req.body)){
            try{
                const borrow = await db.borrow.create({
                    data: {...req.body, wishToReturn: new Date(req.body.wishToReturn)},
                });
                res.send(borrow)
            }catch(err){
                console.log(JSON.stringify(err));
                res.status(500).send({
                    err: "Failed to borrow.",
                });
            }
        } else {
            res.status(400).send({
                err: "Invalid input data.",
            });
        }
    })
    .put("/",async (req, res) => {
        type CreateReturn = {
            memberId: string
            statusId: number
        };
        const schema: JSONSchemaType<CreateReturn> = {
            type: "object",
            properties: {
                memberId:{
                    type: "string",
                    minLength: 10,
                    maxLength: 10,
                },
                statusId:{
                    type:"integer",
                },
            },
            required: ["memberId","statusId"],
        };
        const validator = ajv.compile(schema);
        if (validator(req.body)){
            try{
                const ret = await db.borrow.update({
                    where: {
                        statusId: req.body.statusId,
                    },
                    data: {returned: new Date()}
                });
                res.send(ret)
            }catch(err){
                console.log(JSON.stringify(err));
                res.status(500).send({
                    err: "Failed to return.",
                });
            }
        } else{
            res.status(400).send({
                err: "Invalid input data.",
            });
        }
    })


