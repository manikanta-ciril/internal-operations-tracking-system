import assert from 'node:assert/strict';
import {
  maxAttachmentBytes,
  validateChatFiles,
  imageAccept,
  documentAccept,
  maxFilesPerMessage,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  classifyChatFile,
  validateDroppedFiles,
  isDragDropEnabled,
  setDragDropEnabled,
  dragDropAttachmentRules,
} from '../src/features/messaging/attachment-rules.js';

assert.equal(maxAttachmentBytes, 30 * 1024 * 1024);
// Boundaries: empty, exactly 30 MB, 30 MB + 1, mixed file categories and unsupported extensions.
assert.doesNotThrow(() => validateChatFiles([{ name: 'brief.pdf', size: maxAttachmentBytes }], 'documents'));
assert.throws(() => validateChatFiles([{ name: 'brief.pdf', size: maxAttachmentBytes + 1 }], 'documents'), /30 MB/);
assert.throws(() => validateChatFiles([{ name: 'empty.pdf', size: 0 }], 'documents'));
assert.throws(() => validateChatFiles([{ name: 'image.png', size: 100 }], 'documents'));
assert.throws(() => validateChatFiles([{ name: 'brief.pdf', size: 100 }], 'images'));
assert.throws(() => validateChatFiles([{ name: 'vector.svg', size: 100 }], 'images'));
assert.doesNotThrow(() => validateChatFiles([{ name: 'PHOTO.JPG', size: 100 }], 'images'));
assert.doesNotThrow(() => validateChatFiles([{ name: 'report.doc', size: 100 }, { name: 'sheet.ods', size: 100 }], 'documents'));
assert.ok(!documentAccept.includes('.png') && !imageAccept.includes('.pdf'));

// Drag-and-drop constants and robust extension extraction
assert.equal(maxFilesPerMessage, 10);
assert.equal(getFileExtension('test.FILE.DOCX'), 'docx');
assert.equal(getFileExtension('noextension'), '');
assert.equal(getFileExtension('.gitignore'), '');
assert.equal(getFileExtension('trailingdot.'), '');
assert.equal(getFileExtension(''), '');
assert.equal(getFileExtension(null), '');
assert.equal(getFileExtension(undefined), '');
assert.equal(getFileExtension(123), '');

// Classification guards against extensionless files named like formats
assert.ok(isImageFile('avatar.PNG'));
assert.ok(isImageFile({ name: 'photo.webp' }));
assert.ok(!isImageFile('gif'));
assert.ok(!isImageFile('document.pdf'));
assert.ok(!isImageFile(null));
assert.ok(!isImageFile(undefined));

assert.ok(isDocumentFile('spreadsheet.xlsx'));
assert.ok(isDocumentFile({ name: 'notes.md' }));
assert.ok(!isDocumentFile('pdf'));
assert.ok(!isDocumentFile('photo.jpg'));
assert.ok(!isDocumentFile(null));
assert.ok(!isDocumentFile(undefined));

assert.equal(classifyChatFile('picture.gif'), 'images');
assert.equal(classifyChatFile('report.pdf'), 'documents');
assert.equal(classifyChatFile('script.sh'), null);
assert.equal(classifyChatFile('program.exe'), null);
assert.equal(classifyChatFile('noextension'), null);
assert.equal(classifyChatFile(null), null);

// Drag-and-drop validation boundaries
assert.deepEqual(validateDroppedFiles([]), { images: [], documents: [] });
const dropped = validateDroppedFiles([
  { name: 'photo.jpg', size: 500 },
  { name: 'sheet.xlsx', size: 1200 },
]);
assert.equal(dropped.images.length, 1);
assert.equal(dropped.images[0].name, 'photo.jpg');
assert.equal(dropped.documents.length, 1);
assert.equal(dropped.documents[0].name, 'sheet.xlsx');

// 30 MB boundary & invalid size edge cases for dropped files
assert.doesNotThrow(() =>
  validateDroppedFiles([{ name: 'large.pdf', size: maxAttachmentBytes }]),
);
assert.throws(
  () => validateDroppedFiles([{ name: 'oversized.pdf', size: maxAttachmentBytes + 1 }]),
  /30 MB/,
);
assert.throws(
  () => validateDroppedFiles([{ name: 'zero.png', size: 0 }]),
  /nonempty file/,
);
assert.throws(
  () => validateDroppedFiles([{ name: 'negative.png', size: -10 }]),
  /nonempty file/,
);
assert.throws(
  () => validateDroppedFiles([{ name: 'nan.png', size: NaN }]),
  /nonempty file/,
);
assert.throws(
  () => validateDroppedFiles([null]),
  /nonempty file/,
);

// Max 10 files per message boundary
assert.doesNotThrow(() =>
  validateDroppedFiles(
    Array.from({ length: 10 }, (_, i) => ({ name: `file${i}.png`, size: 100 })),
    0,
  ),
);
assert.throws(
  () =>
    validateDroppedFiles(
      Array.from({ length: 6 }, (_, i) => ({ name: `file${i}.png`, size: 100 })),
      5,
    ),
  /at most 10 files/,
);

// Unsupported extensions in dropped files
assert.throws(
  () => validateDroppedFiles([{ name: 'archive.zip', size: 500 }]),
  /supported image or document/,
);
assert.throws(
  () => validateDroppedFiles([{ name: 'design.svg', size: 500 }]),
  /supported image or document/,
);
assert.throws(
  () => validateDroppedFiles([{ name: 'extensionless_file', size: 500 }]),
  /supported image or document/,
);

// Drag-and-drop enabled/disabled state toggles
assert.equal(isDragDropEnabled(), true);
assert.equal(setDragDropEnabled(false), false);
assert.equal(isDragDropEnabled(), false);
assert.equal(setDragDropEnabled(true), true);
assert.equal(isDragDropEnabled(), true);

// dragDropAttachmentRules structure
assert.equal(dragDropAttachmentRules.maxAttachmentBytes, 30 * 1024 * 1024);
assert.equal(dragDropAttachmentRules.maxFilesPerMessage, 10);
assert.equal(typeof dragDropAttachmentRules.isDragDropEnabled, 'function');
assert.equal(typeof dragDropAttachmentRules.setDragDropEnabled, 'function');
assert.equal(dragDropAttachmentRules.closeLabel, 'Close file sharing');
assert.equal(dragDropAttachmentRules.cancelLabel, 'Cancel drag and drop');
assert.equal(dragDropAttachmentRules.disableLabel, 'Disable drag-and-drop file sharing');
assert.ok(dragDropAttachmentRules.summary.includes('30 MB'));

console.log('PASS: strict image/document selection, inclusive 30 MB boundary, robust extension parsing, and drag-and-drop attachment rules.');
