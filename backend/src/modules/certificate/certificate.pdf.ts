import PDFDocument from "pdfkit";
import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: Date;

  // Optional:
  // If provided, selected custom template is used.
  // If not provided, default local template is used.
  templateUrl?: string | null;
}

/**
 * Default certificate template.
 *
 * Project structure:
 *
 * src/
 * └── modules/
 *     ├── certificate/
 *     │   └── certificate.pdf.ts
 *     └── certificate-template/
 *         └── assets/
 *             └── certificatepdf.png
 */
const getDefaultTemplatePath = (): string => {
  const possiblePaths = [
    // Development / source structure
    path.resolve(
      __dirname,
      "../certificate-template/assets/certiifcatepdf.png",
    ),

    // Running from project root with ts-node/tsx
    path.resolve(
      process.cwd(),
      "src/modules/certificate-template/assets/certiifcatepdf.png",
    ),

    // Production / compiled structure
    path.resolve(
      process.cwd(),
      "dist/modules/certificate-template/assets/certiifcatepdf.png",
    ),
  ];

  const existingPath = possiblePaths.find((filePath) =>
    fs.existsSync(filePath),
  );

  if (!existingPath) {
    throw new Error(
      "Default certificate template not found",
    );
  }

  return existingPath;
};

/**
 * Download an image template from a URL.
 */
const downloadImage = (
  url: string,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https")
      ? https
      : http;

    const request = client.get(
      url,
      (response) => {
        // Follow redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          downloadImage(
            response.headers.location,
          )
            .then(resolve)
            .catch(reject);

          return;
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download certificate template. Status: ${response.statusCode}`,
            ),
          );

          return;
        }

        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk));
        });

        response.on("end", () => {
          const buffer = Buffer.concat(chunks);

          if (buffer.length === 0) {
            reject(
              new Error(
                "Certificate template downloaded as empty file",
              ),
            );

            return;
          }

          resolve(buffer);
        });

        response.on("error", reject);
      },
    );

    request.on("error", reject);
  });
};

/**
 * Generate certificate PDF.
 *
 * Template selection:
 *
 * 1. templateUrl provided
 *    → use selected custom template
 *
 * 2. templateUrl missing/null
 *    → use default local certificate template
 */
export function generateCertificatePdf(
  data: CertificatePdfData,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
      autoFirstPage: true,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);

      if (pdfBuffer.length === 0) {
        reject(
          new Error(
            "Generated certificate PDF is empty",
          ),
        );

        return;
      }

      // PDF files must start with %PDF
      const pdfHeader = pdfBuffer
        .subarray(0, 4)
        .toString("ascii");

      if (pdfHeader !== "%PDF") {
        reject(
          new Error(
            `Generated certificate is not a valid PDF. Header: ${pdfHeader}`,
          ),
        );

        return;
      }

      resolve(pdfBuffer);
    });

    doc.on("error", (error) => {
      reject(error);
    });

    (async () => {
      try {
        let templateBuffer: Buffer;

        /*
         * CUSTOM TEMPLATE
         *
         * If templateUrl exists, use the selected
         * certificate template from the database.
         */
        if (data.templateUrl) {
          templateBuffer =
            await downloadImage(
              data.templateUrl,
            );
        } else {
          /*
           * DEFAULT TEMPLATE
           *
           * No template selected means:
           *
           * certificate-template/assets/certificatepdf.png
           */
          const defaultTemplatePath =
            getDefaultTemplatePath();

          templateBuffer = fs.readFileSync(
            defaultTemplatePath,
          );
        }

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        /*
         * Certificate background
         */
        doc.image(
          templateBuffer,
          0,
          0,
          {
            width: pageWidth,
            height: pageHeight,
          },
        );

        /*
         * Student Name
         */
        doc
          .font("Times-Bold")
          .fontSize(
            Math.min(
              21,
              Math.max(15, 460 / data.studentName.length),
            ),
          )
          .fillColor("#12233F")
          .text(
            data.studentName,
            pageWidth * 0.25,
            pageHeight * 0.405,
            {
              width: pageWidth * 0.58,
              align: "center",
              lineBreak: false,
            },
          );

        /*
         * Course Name
         */
        doc
          .font("Times-Italic")
          .fontSize(
            Math.min(
              13,
              Math.max(10, 320 / data.courseTitle.length),
            ),
          )
          .fillColor("#12233F")
          .text(
            data.courseTitle,
            pageWidth * 0.27,
            pageHeight * 0.518,
            {
              width: pageWidth * 0.56,
              align: "center",
              lineBreak: false,
            },
          );

        /*
         * Issued Date
         */
        const issuedDate =
          new Intl.DateTimeFormat(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            },
          ).format(data.issuedAt);

        doc
          .font("Times-Roman")
          .fontSize(10)
          .fillColor("#12233F")
          .text(
            issuedDate,
            pageWidth * 0.28,
            pageHeight * 0.754,
            {
              width: pageWidth * 0.16,
              align: "center",
              lineBreak: false,
            },
          );

        /*
         * Certificate ID
         */
        doc
          .font("Times-Roman")
          .fontSize(
            Math.min(
              9,
              Math.max(7, 190 / data.certificateId.length),
            ),
          )
          .fillColor("#12233F")
          .text(
            data.certificateId,
            pageWidth * 0.50,
            pageHeight * 0.754,
            {
              width: pageWidth * 0.23,
              align: "center",
              lineBreak: false,
            },
          );

        /*
         * Finalize PDF
         */
        doc.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}