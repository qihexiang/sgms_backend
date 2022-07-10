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
            goodsId: number[]
            wishToReturn: number
            memberId: string
            personId: string
            description: string
        };
        const schema: JSONSchemaType<CreateBorrow> = {
            type: "object",
            properties: {
                goodsId: { 
                    type: "array",
                    items: {
                        type: "number",
                    }
                },
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

            },
             required: ["wishToReturn","memberId","personId","description","goodsId"], 
        };
        const validator = ajv.compile(schema);
        if (validator(req.body)){
            for (let i of req.body.goodsId){
                try{
                    const borrow = await db.borrow.create({
                        data: {
                            wishToReturn: new Date(req.body.wishToReturn),
                            member: {
                                connect: {
                                    schoolId: req.body.memberId
                                }
                            },
                            person: {
                                connect:{
                                    schoolId: req.body.personId
                                }
                            },
                            description: req.body.description,
                            status: {
                                create: {
                                    goods: {
                                        connect: {
                                            id: i,
                                        }
                                    }
                                }
                            }
                        },
                    });
                    res.send(borrow)
                }catch(err){
                    console.log(JSON.stringify(err));
                    res.status(500).send({
                        err: "Failed to borrow.",
                    });
                }
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
            borrowId: number
            placement: string
        };
        const schema: JSONSchemaType<CreateReturn> = {
            type: "object",
            properties: {
                memberId:{
                    type: "string",
                    minLength: 10,
                    maxLength: 10,
                },
                borrowId:{
                    type:"integer",
                },
                placement:{
                    type: "string",
                }
            },
            required: ["memberId","borrowId","placement"],
        };
        const validator = ajv.compile(schema);
        if (validator(req.body)){
            try{
                const ret = await db.borrow.update({
                    where: {
                        id: req.body.borrowId,
                    },
                    data: {returned: new Date()},
                    include: {
                        status: {
                            include: {
                                goods: {
                                    select: {
                                        id: true,
                                    }
                                }
                            }
                        }
                    }
                });
                await db.placement.create({
                    data:{
                        place: req.body.placement,
                    at: new Date(),
                    member: {
                        connect: {
                            schoolId: req.body.memberId,
                        }
                    },
                    status: {
                        create: {
                            goods: {
                                connect: {
                                    id: ret.status.goods.id
                                }
                            }
                        }
                    }
                    }
                })
                res.send(ret)
            }
            catch(err){
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


    export default borrowRoute;
