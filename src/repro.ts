import {
  CompletedPart,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const bucket = "test-bucket";
const multiPartUploadThresholdBytes = 5 * 1024 * 1024;

const client = new S3Client({
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
});

const createBucket = async () => {
  try {
    await client.send(
      new CreateBucketCommand({
        Bucket: bucket,
      })
    );
  } catch (e) {
    console.log(e);
  }
};

const multipartTest = async (fileName: string) => {
  try {
    const fileStream = fs.createReadStream(fileName);

    const createMultipartUploadRes = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: fileName,
      })
    );
    const uploadId = createMultipartUploadRes.UploadId;

    const parts: CompletedPart[] = [];
    let partBuffer = Buffer.alloc(0);
    let partNumber = 1;

    const uploadChunk = async () => {
      const partRes = await client.send(
        new UploadPartCommand({
          Bucket: bucket,
          Key: fileName,
          UploadId: uploadId,
          Body: partBuffer,
          PartNumber: partNumber,
        })
      );
      parts.push({ ETag: partRes.ETag, PartNumber: partNumber });
      partNumber++;
      partBuffer = Buffer.alloc(0);
    };

    for await (const chunk of fileStream) {
      partBuffer = Buffer.concat([partBuffer, chunk]);
      if (partBuffer.length >= multiPartUploadThresholdBytes) {
        await uploadChunk();
      }
    }

    if (partBuffer.length > 0) {
      await uploadChunk();
    }
  } catch (err) {
    console.error(`error while performing S3 multipart:\n ${err}`);
  }
};

const runRepro = async () => {
  await createBucket();
  await multipartTest(path.join(__dirname, "not_whole_part.txt"));
  await multipartTest(path.join(__dirname, "two_whole_parts.txt"));
};

runRepro();
