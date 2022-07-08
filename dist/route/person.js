"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajv_1 = __importDefault(require("ajv"));
const db_1 = __importDefault(require("../db"));
const ajv = new ajv_1.default();
const personRoute = (0, express_1.Router)();
personRoute.post("/:name/:schoolId/:tel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = {
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
            tel: {
                type: "string"
            }
        },
        required: ["name", "schoolId", "tel"]
    };
    const validator = ajv.compile(schema);
    if (validator(req.params)) {
        try {
            const result = yield db_1.default.person.create({
                data: req.params
            });
            res.send(result);
        }
        catch (err) {
            console.log(JSON.stringify(err));
            res.status(500).send({
                err: "Failed to create user."
            });
        }
    }
    else {
        res.status(400).send({
            err: "Invalid input data."
        });
    }
}));
exports.default = personRoute;
