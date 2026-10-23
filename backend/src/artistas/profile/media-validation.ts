import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { PDFDict, PDFDocument, PDFName, PDFArray, PDFStream } from 'pdf-lib';
import { randomUUID } from 'crypto';

export const MEDIA_BUCKET = 'artist-media';
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export type MediaKind = 'photo' | 'gallery' | 'portfolio';
export type MediaFiles = {
  photo?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
  portfolio?: Express.Multer.File[];
};
export type PreparedMedia = {
  id: string;
  kind: MediaKind;
  name: string;
  mime: string;
  buffer: Buffer;
  thumbnail?: Buffer;
  width?: number;
  height?: number;
};

// A leitura estrutural é complementar, não substitui um scanner antimalware.
function inspectPdfObject(object: unknown, seen = new Set<unknown>()) {
  if (seen.has(object)) return;
  seen.add(object);
  if (object instanceof PDFDict) {
    for (const [key, value] of object.entries()) {
      if (
        [
          'JS',
          'JavaScript',
          'OpenAction',
          'AA',
          'EmbeddedFiles',
          'EF',
          'RichMedia',
          'XFA',
        ].includes(key.decodeText())
      )
        throw new Error('active_pdf');
      if (
        key.decodeText() === 'S' &&
        value instanceof PDFName &&
        [
          'JavaScript',
          'Launch',
          'GoToR',
          'GoToE',
          'SubmitForm',
          'ImportData',
          'Rendition',
        ].includes(value.decodeText())
      )
        throw new Error('active_pdf');
      inspectPdfObject(value, seen);
    }
  } else if (object instanceof PDFArray)
    for (const value of object.asArray()) inspectPdfObject(value, seen);
  else if (object instanceof PDFStream) inspectPdfObject(object.dict, seen);
}

export async function prepareMedia(
  files: MediaFiles = {},
): Promise<PreparedMedia[]> {
  const result: PreparedMedia[] = [];
  for (const [field, items] of Object.entries(files)) {
    if (
      !['photo', 'gallery', 'portfolio'].includes(field) ||
      !Array.isArray(items) ||
      items.length > (field === 'gallery' ? 8 : 1)
    )
      throw new BadRequestException(
        'Envie uma foto, até 8 imagens de galeria e um PDF.',
      );
    for (const file of items) {
      if (
        !file.buffer?.length ||
        file.size !== file.buffer.length ||
        file.size > MAX_FILE_BYTES
      )
        throw new BadRequestException('Arquivo vazio ou acima de 10 MB.');
      // Nome apenas para exibição; controles não podem chegar ao cabeçalho HTTP.
      const name =
        file.originalname
          .replace(/\\/g, '/')
          .split('/')
          .pop()
          ?.split('')
          .filter(
            (ch) =>
              ch.charCodeAt(0) >= 32 &&
              ch.charCodeAt(0) !== 127 &&
              !'"<>'.includes(ch),
          )
          .join('')
          .slice(0, 120) || 'portfolio.pdf';
      // Paths nunca incorporam esse nome; somente UUID gerado no servidor.
      const extension = name.split('.').pop()?.toLowerCase();
      try {
        if (field === 'portfolio') {
          if (
            extension !== 'pdf' ||
            file.mimetype !== 'application/pdf' ||
            !file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))
          )
            throw new Error('invalid_pdf');
          const doc = await PDFDocument.load(file.buffer, {
            ignoreEncryption: false,
            throwOnInvalidObject: true,
          });
          if (!doc.getPageCount()) throw new Error('empty_pdf');
          for (const [, object] of doc.context.enumerateIndirectObjects())
            inspectPdfObject(object);
          result.push({
            id: randomUUID(),
            kind: 'portfolio',
            name,
            mime: 'application/pdf',
            buffer: file.buffer,
          });
        } else {
          const formats: Record<string, string> = {
            jpg: 'jpeg',
            jpeg: 'jpeg',
            png: 'png',
            webp: 'webp',
          };
          if (
            !extension ||
            !formats[extension] ||
            file.mimetype !== `image/${formats[extension]}`
          )
            throw new Error('invalid_image');
          const metadata = await sharp(file.buffer, {
            limitInputPixels: 40_000_000,
            failOn: 'warning',
          }).metadata();
          if (
            metadata.format !== formats[extension] ||
            !metadata.width ||
            !metadata.height ||
            metadata.width > 8000 ||
            metadata.height > 8000 ||
            (metadata.pages || 1) > 1
          )
            throw new Error('image_dimensions');
          const full = await sharp(file.buffer, {
            limitInputPixels: 40_000_000,
            failOn: 'warning',
          })
            .rotate()
            .resize({
              width: 1920,
              height: 1920,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .webp({ quality: 82 })
            .toBuffer({ resolveWithObject: true });
          const thumbnail = await sharp(full.data)
            .resize({
              width: 480,
              height: 480,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .webp({ quality: 76 })
            .toBuffer();
          if (full.data.length > MAX_FILE_BYTES) throw new Error('image_size');
          result.push({
            id: randomUUID(),
            kind: field as MediaKind,
            name,
            mime: 'image/webp',
            buffer: full.data,
            thumbnail,
            width: full.info.width,
            height: full.info.height,
          });
        }
      } catch {
        throw new BadRequestException(
          field === 'portfolio'
            ? 'Envie um PDF válido, sem senha, anexos ou ações ativas, de até 10 MB.'
            : 'Envie JPEG, PNG ou WebP válido, estático, até 10 MB, 8000px por lado e 40 megapixels.',
        );
      }
    }
  }
  return result;
}
