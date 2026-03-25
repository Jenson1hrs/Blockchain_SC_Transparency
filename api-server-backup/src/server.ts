import express, { Request, Response } from "express";

const app = express();

app.get("/", (_req: Request, res: Response) => {
    res.send("Blockchain API is running");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});