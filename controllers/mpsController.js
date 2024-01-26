// Imports and consts
import { v4 as uuidv4 } from 'uuid';
import multer from "multer";
import path from "path";
import fs from 'fs';


// Main class
class mpsController {
    async getMps(req, res) {
        try {
            const { umpid } = req.body;
            const mpsListPath = `db/${umpid}`
            if (!umpid && !fs.existsSync(mpsListPath)) {
                return res.status(400);
            }

            fs.readdir(mpsListPath, (err, files) => {
                if (err) {
                    return res.status(500).send();
                }

                const jsonFile = files.find(file => path.extname(file) === '.json');
                if (!jsonFile) {
                    return res.status(500).send();
                }

                const jsonFilePath = path.join(mpsListPath, jsonFile);
                fs.readFile(jsonFilePath, 'utf-8', (jsonErr, jsonData) => {
                    if (jsonErr) {
                        return res.status(500).send();
                    }

                    let parsedData;
                    try {
                        parsedData = JSON.parse(jsonData);
                    } catch (parseErr) {
                        return res.status(500).send();
                    }

                    const responseData = {
                        data: parsedData,
                        images: [],
                    };

                    const imageFiles = files.filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase()));
                    imageFiles.forEach(imageFile => {
                        const imagePath = path.join(mpsListPath, imageFile);
                        const imageBase64 = fs.readFileSync(imagePath, 'base64');
                        responseData.images.push({name: imageFile, data: imageBase64});
                    });
                    res.status(200).json(responseData);
                })
            })
        } catch (e) {
            console.error(e);
            return res.status(500);
        }
    }

    async createMp(req, res) {
        try {
            const umpid = uuidv4().replace(/-/g, '').toUpperCase();;

            fs.mkdir(`db/${umpid}`, { recursive: true }, (err) => {});
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, `db/${umpid}`);
                },
                filename: function (req, file, cb) {
                    cb(null, umpid + "_" + Date.now() + path.extname(file.originalname));
                },
            });
            const upload = multer({
                storage: storage,
            });
            upload.array("posters", 20)(req, res, async function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500);
                }
                const {data} = req.body
                fs.writeFile(`db/${umpid}/datas.json`, data, (err) => {});

                return res.status(200).json({umpid});
            });
        } catch (e) {
            console.error(e);
            return res.status(500);
        }
    }
}

export default new mpsController();
