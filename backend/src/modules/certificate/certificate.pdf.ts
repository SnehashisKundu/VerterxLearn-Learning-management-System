import PDFDocument from "pdfkit";
import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface CertificateLayoutPosition {
  x: number;
  y: number;
  width: number;
}

export interface CertificateLayout {
  studentName: CertificateLayoutPosition;
  courseTitle: CertificateLayoutPosition;
  issuedDate: CertificateLayoutPosition;
  certificateId: CertificateLayoutPosition;
}

interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  certificateId: string;
  issuedAt: Date;

  /**
   * Custom template selected by admin.
   */
  templateUrl?: string | null;

  /**
   * Layout belonging to selected template.
   */
  layout?: CertificateLayout | null;
}

/**
 * ============================================================
 * DEFAULT LAYOUT
 * ============================================================
 *
 * Used ONLY when admin has not supplied a custom layout.
 *
 * Coordinates are normalized:
 *
 * x = 0 → left
 * x = 1 → right
 *
 * y = 0 → top
 * y = 1 → bottom
 *
 * width = percentage of page width
 */
export const DEFAULT_CERTIFICATE_LAYOUT: CertificateLayout = {
  studentName: {
    x: 0.25,
    y: 0.395,
    width: 0.50,
  },

  courseTitle: {
    x: 0.27,
    y: 0.535,
    width: 0.46,
  },

  issuedDate: {
    x: 0.245,
    y: 0.785,
    width: 0.18,
  },

  certificateId: {
    x: 0.475,
    y: 0.785,
    width: 0.27,
  },
};

/**
 * ============================================================
 * DEFAULT TEMPLATE
 * ============================================================
 */
const getDefaultTemplatePath = (): string => {
  const possiblePaths = [
    path.resolve(
      __dirname,
      "../certificate-template/assets/certiifcatepdf.png",
    ),

    path.resolve(
      process.cwd(),
      "src/modules/certificate-template/assets/certiifcatepdf.png",
    ),

    path.resolve(
      process.cwd(),
      "dist/modules/certificate-template/assets/certiifcatepdf.png",
    ),
  ];

  const existingPath =
    possiblePaths.find(
      (filePath) =>
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
 * ============================================================
 * DOWNLOAD TEMPLATE
 * ============================================================
 */
const downloadImage = (
  url: string,
): Promise<Buffer> => {
  return new Promise(
    (resolve, reject) => {
      const client =
        url.startsWith("https")
          ? https
          : http;

      const request = client.get(
        url,
        (response) => {
          /**
           * Redirect.
           */
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

          /**
           * Failed request.
           */
          if (
            response.statusCode !== 200
          ) {
            reject(
              new Error(
                `Failed to download certificate template. Status: ${response.statusCode}`,
              ),
            );

            return;
          }

          const chunks: Buffer[] = [];

          response.on(
            "data",
            (chunk) => {
              chunks.push(
                Buffer.from(chunk),
              );
            },
          );

          response.on(
            "end",
            () => {
              const buffer =
                Buffer.concat(
                  chunks,
                );

              if (
                buffer.length === 0
              ) {
                reject(
                  new Error(
                    "Certificate template downloaded as empty file",
                  ),
                );

                return;
              }

              resolve(buffer);
            },
          );

          response.on(
            "error",
            reject,
          );
        },
      );

      request.on(
        "error",
        reject,
      );
    },
  );
};

/**
 * ============================================================
 * SAFE NORMALIZATION
 * ============================================================
 */
const normalizeLayout = (
  layout:
    | CertificateLayout
    | null
    | undefined,
): CertificateLayout => {
  if (!layout) {
    return DEFAULT_CERTIFICATE_LAYOUT;
  }

  return layout;
};

/**
 * ============================================================
 * FONT SIZES
 * ============================================================
 */

const getStudentNameFontSize = (
  name: string,
): number => {
  const length =
    name.trim().length;

  if (length <= 20) return 22;
  if (length <= 28) return 20;
  if (length <= 36) return 18;
  if (length <= 45) return 16;

  return 15;
};

const getCourseFontSize = (
  title: string,
): number => {
  const length =
    title.trim().length;

  if (length <= 30) return 13;
  if (length <= 45) return 12;
  if (length <= 60) return 11;

  return 10;
};

const getCertificateIdFontSize = (
  id: string,
): number => {
  const length =
    id.trim().length;

  if (length <= 30) return 10;
  if (length <= 38) return 9;

  return 8;
};

/**
 * ============================================================
 * GENERATE CERTIFICATE
 * ============================================================
 */
export function generateCertificatePdf(
  data: CertificatePdfData,
): Promise<Buffer> {
  return new Promise(
    (resolve, reject) => {
      const doc =
        new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 0,
          autoFirstPage: true,
        });

      const chunks: Buffer[] = [];

      doc.on(
        "data",
        (chunk: Buffer) => {
          chunks.push(chunk);
        },
      );

      doc.on(
        "end",
        () => {
          const pdfBuffer =
            Buffer.concat(chunks);

          if (
            pdfBuffer.length === 0
          ) {
            reject(
              new Error(
                "Generated certificate PDF is empty",
              ),
            );

            return;
          }

          const header =
            pdfBuffer
              .subarray(0, 4)
              .toString("ascii");

          if (header !== "%PDF") {
            reject(
              new Error(
                `Generated certificate is not a valid PDF. Header: ${header}`,
              ),
            );

            return;
          }

          resolve(pdfBuffer);
        },
      );

      doc.on(
        "error",
        reject,
      );

      (async () => {
        try {
          /**
           * ====================================================
           * SELECT TEMPLATE
           * ====================================================
           */
          let templateBuffer: Buffer;

          if (
            data.templateUrl
          ) {
            templateBuffer =
              await downloadImage(
                data.templateUrl,
              );
          } else {
            const defaultPath =
              getDefaultTemplatePath();

            templateBuffer =
              fs.readFileSync(
                defaultPath,
              );
          }

          /**
           * ====================================================
           * PAGE
           * ====================================================
           */
          const pageWidth =
            doc.page.width;

          const pageHeight =
            doc.page.height;

          /**
           * ====================================================
           * LAYOUT
           * ====================================================
           */
          const layout =
            normalizeLayout(
              data.layout,
            );

          /**
           * ====================================================
           * BACKGROUND
           * ====================================================
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

          /**
           * ====================================================
           * STUDENT NAME
           * ====================================================
           */
          doc
            .font("Times-Bold")
            .fontSize(
              getStudentNameFontSize(
                data.studentName,
              ),
            )
            .fillColor("#12233F")
            .text(
              data.studentName,
              layout.studentName.x *
                pageWidth,
              layout.studentName.y *
                pageHeight,
              {
                width:
                  layout.studentName
                    .width *
                  pageWidth,

                align: "center",

                lineBreak: false,
              },
            );

          /**
           * ====================================================
           * COURSE TITLE
           * ====================================================
           */
          doc
            .font("Times-Italic")
            .fontSize(
              getCourseFontSize(
                data.courseTitle,
              ),
            )
            .fillColor("#12233F")
            .text(
              data.courseTitle,
              layout.courseTitle.x *
                pageWidth,
              layout.courseTitle.y *
                pageHeight,
              {
                width:
                  layout.courseTitle
                    .width *
                  pageWidth,

                align: "center",

                lineBreak: false,
              },
            );

          /**
           * ====================================================
           * ISSUED DATE
           * ====================================================
           */
          const issuedDate =
            new Intl.DateTimeFormat(
              "en-GB",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              },
            ).format(
              data.issuedAt,
            );

          doc
            .font("Times-Roman")
            .fontSize(10)
            .fillColor("#12233F")
            .text(
              issuedDate,
              layout.issuedDate.x *
                pageWidth,
              layout.issuedDate.y *
                pageHeight,
              {
                width:
                  layout.issuedDate
                    .width *
                  pageWidth,

                align: "center",

                lineBreak: false,
              },
            );

          /**
           * ====================================================
           * CERTIFICATE ID
           * ====================================================
           */
          doc
            .font("Times-Roman")
            .fontSize(
              getCertificateIdFontSize(
                data.certificateId,
              ),
            )
            .fillColor("#12233F")
            .text(
              data.certificateId,
              layout.certificateId.x *
                pageWidth,
              layout.certificateId.y *
                pageHeight,
              {
                width:
                  layout.certificateId
                    .width *
                  pageWidth,

                align: "center",

                lineBreak: false,
              },
            );

          /**
           * ====================================================
           * FINALIZE
           * ====================================================
           */
          doc.end();
        } catch (error) {
          reject(error);
        }
      })();
    },
  );
}