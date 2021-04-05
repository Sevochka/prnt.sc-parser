import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import path from "path";
import express from "express";
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`<h1>
        Hello world
    </h1>`)
})

app.listen(port, () => {
    console.log("Server has been started")
})

const url = "https://prnt.sc/",
    dict = "abcdefghijklmnopqrstuvwxyz0123456789",
    dir = "./images",
    brokenSrc = "https://i.imgur.com/UNs3ikL.jpg";

let iterations = 1000;

const createDirectory = () => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const genLink = (url, length) => {
    let link = "";
    for (let i = 0; i < length-3; i++) {
        const randomNumber = getRandomInt(dict.length - 1);
        link += dict[randomNumber];
    }
    return url + "10m" + link;
}

const saveImgByUrl = (url, name) => {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => {
            const buffer = Buffer.from(response.data, 'binary');
            const currentPath = path.join("./images", `${name}.png`);
            console.log(currentPath)
            fs.writeFile(currentPath, buffer, () =>
                console.log(`Сохранение изображения #${name} завершено.`));
        })
}

(async function () {
    createDirectory();
    for (let i = 0; i < iterations; i++) {
        const uri = genLink(url, 7);
        console.log(`Начало работы с ${uri}`);

        try {
            const response = await axios.get(uri);

            if (response.status === 200) {
                const $ = cheerio.load(response.data)
                const imageUrl = $('#screenshot-image').attr('src');
                if (imageUrl === brokenSrc) {
                    console.log("Картинка невалидна!")
                    continue;
                } else {
                    await saveImgByUrl(imageUrl, i);
                }
                console.log(`------------------------------------------------------------------------------------------------`);
            }
        }
        catch (error) {
            console.log("Ошибка");
        }
    }
})();
