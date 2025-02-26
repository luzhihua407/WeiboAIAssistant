import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ejs from 'ejs';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';


class Utils {
  // Delete file if it exists
  static deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        fs.removeSync(filePath);
        console.log(`File ${filePath} has been deleted.`);
      } catch (e) {
        console.log(`Error deleting file: ${e}`);
      }
    } else {
      console.log(`File ${filePath} does not exist.`);
    }
  }

  // Write text to file
  static writeFile(filePath, text) {
    // Ensure the directory exists
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' });
  }

  // Read content from a file
  static readFile(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, { encoding: 'utf-8' });
    }
    return null;
  }

  // Read all lines from a file
  static readLines(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, { encoding: 'utf-8' }).split('\n');
    }
    return [];
  }

  // Screenshot functionality
  static async screenshot(page, imagePath) {
    await page.screenshot({ path: imagePath });
  }

  // Sleep for a specified number of seconds
  static async sleep(ms) {
    console.log(`Waiting for ${ms}ms`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Render an EJS template with data
  static renderTemplate(templatePath, data) {
    const template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    return ejs.render(template, data);
  }


  // Scroll the page
  static async wheel(page, deltaX, deltaY) {
    try {
      await page.mouse.wheel(deltaX, deltaY);
    } catch (e) {
      console.log(`Error scrolling: ${e}`);
    }
  }

  // Create a JSON file if it doesn't exist
  static createJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeJsonSync(filePath, {}, { spaces: 2 });
      console.log(`File ${filePath} created.`);
    }
  }

  // Create PDF canvas
  static getPdfCanvas(outputFilename) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputFilename));
    return doc;
  }

  // Add text to PDF
  static textToPdf(doc, text) {
    doc.fontSize(10).text(text, 10, 100);
  }

  // Save PDF document
  static savePdf(doc) {
    doc.end();
  }

  // Download an image and save it locally
  static async downloadImage(imageUrl, imgPath, fileName = null) {
    if (!imgPath.endsWith(path.sep)) {
      imgPath += path.sep;
    }

    // Generate a unique file name if not provided
    const uniqueFilename = fileName || `${uuidv4()}.jpg`;
    const imgFilePath = path.join(imgPath, uniqueFilename);

    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.ensureDirSync(imgPath); // Ensure the folder exists
      fs.writeFileSync(imgFilePath, response.data);
      return imgFilePath;
    } catch (e) {
      console.log(`Failed to download image. Status code: ${e.response ? e.response.status : 'unknown'}`);
      return null;
    }
  }
}

export default Utils;
