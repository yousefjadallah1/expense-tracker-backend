import { Response } from "express";

export const Ok = (res: Response, data?: any, message?: string) => {
    return res.status(200).json({
        success: true,
        message: message || "Success",
        data
    });
};

export const Created = (res: Response, data?: any, message?: string) => {
    return res.status(201).json({
        success: true,
        message: message || "Created successfully",
        data
    });
};

export const BadRequest = (res: Response, message?: string, errors?: any) => {
    return res.status(400).json({
        success: false,
        message: message || "Bad request",
        errors
    });
};

export const Unauthorized = (res: Response, message?: string) => {
    return res.status(401).json({
        success: false,
        message: message || "Unauthorized"
    });
};

export const NotFound = (res: Response, message?: string) => {
    return res.status(404).json({
        success: false,
        message: message || "Not found"
    });
};

export const ServerError = (res: Response, message?: string, error?: any) => {
    return res.status(500).json({
        success: false,
        message: message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined
    });
};