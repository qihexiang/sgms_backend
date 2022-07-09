import { Router } from "express";
import Ajv, { JSONSchemaType } from "ajv";
import db from "../db";

const ajv = new Ajv();

const memberRoute = Router();

memberRoute
  .post("/:name/:schoolId/:department/:tel", async (req, res) => {
    type Params = {
      name: string;
      schoolId: string;
      department:string;
      tel: string;
    };
    const schema: JSONSchemaType<Params> = {
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 2,
        },
        schoolId: {
          type: "string",
          minLength: 10,
          maxLength: 10,
        },
        department:{
            type:"string",
            minLength:3,
            maxLength:5,
        },
        tel: {
          type: "string",
        },
      },
      required: ["name", "schoolId","department", "tel"],
    };
    const validator = ajv.compile(schema);
    if (validator(req.params)) {
      try {
        const result = await db.member.create({
          data: req.params,
        });
        res.send(result);
      } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).send({
          err: "Failed to create user.",
        });
      }
    } else {
      res.status(400).send({
        err: "Invalid input data.",
      });
    }
  })
  .put("/:schoolId/tel/:newTel", async (req, res) => {
    const { schoolId, newTel } = req.params;
    try {
      const result = await db.member.update({
        where: {
          schoolId,
        },
        data: {
          tel: newTel,
        },
      });
      res.send(result);
    } catch (err) {
      res.status(500).send({
        err: "Failed to update tel info.",
      });
    }
  })
  .get("/:schoolId", async (req, res) => {
    try {
      const result = await db.member.findUnique({
        where: {
          schoolId: req.params.schoolId,
        },
        include: {
          borrows: true,
        },
      });
      res.send(result);
    } catch (err) {
      res.status(500).send("Failed to get data.");
    }
  });

export default memberRoute;
