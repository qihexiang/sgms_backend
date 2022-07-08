import { Router } from "express";
import Ajv, {JSONSchemaType} from "ajv"
import db from "../db";

const ajv = new Ajv()

const personRoute = Router();

personRoute.post("/:name/:schoolId/:tel", async (req, res) => {
    type Params = {
        name: string, schoolId: string, tel: string
    }
    const schema: JSONSchemaType<Params> = {
        type: "object",
        properties: {
            name: {
                type: "string",
                minLength: 2
            },
            schoolId: {
                type: "string",
                minLength: 10,
                maxLength: 10
            },
            tel:{
                type: "string"
            }
        },
        required: ["name", "schoolId", "tel"]
    }
    const validator = ajv.compile(schema)
    if(validator(req.params)) {
        try {
            const result = await db.person.create({
                data: req.params
            })
            res.send(result)
        } catch(err) {
            console.log(JSON.stringify(err))
            res.status(500).send({
                err: "Failed to create user."
            })
        }
    } else {
        res.status(400).send({
            err: "Invalid input data."
        })
    }
})

export default personRoute