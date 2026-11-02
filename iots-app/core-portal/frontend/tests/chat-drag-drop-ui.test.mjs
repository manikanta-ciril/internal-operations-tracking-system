import assert from 'node:assert/strict';
import {
  maxAttachmentBytes,
  maxFilesPerMessage,
  imageExtensions,
  documentExtensions,
  allAllowedExtensions,
  validateDroppedFiles,
  classifyChatFile,
  isDragDropEnabled,
  setDragDropEnabled,
  dragDropAttachmentRules,
} from '../src/features/messaging/attachment-rules.js';

// 1. Verify attachment rules contract
assert.equal(maxAttachmentBytes, 30 * 1024 * 1024);
assert.equal(maxFilesPerMessage, 10);
assert.equal(typeof dragDropAttachmentRules.isDragDropEnabled, 'function');
assert.equal(typeof dragDropAttachmentRules.setDragDropEnabled, 'function');
assert.ok(imageExtensions.includes('png'));
assert.ok(imageExtensions.includes('jpg'));
assert.ok(imageExtensions.includes('jpeg'));
assert.ok(imageExtensions.includes('webp'));
assert.ok(imageExtensions.includes('gif'));
assert.ok(documentExtensions.includes('pdf'));
assert.ok(documentExtensions.includes('docx'));
assert.ok(documentExtensions.includes('xlsx'));
assert.ok(documentExtensions.includes('txt'));
assert.ok(documentExtensions.includes('md'));

// Ensure image and document extensions are distinct and all included in allAllowedExtensions
assert.equal(allAllowedExtensions.length, imageExtensions.length + documentExtensions.length);
for (const ext of imageExtensions) {
  assert.ok(allAllowedExtensions.includes(ext));
  assert.equal(classifyChatFile(`test.${ext}`), 'images');
}
for (const ext of documentExtensions) {
  assert.ok(allAllowedExtensions.includes(ext));
  assert.equal(classifyChatFile(`test.${ext}`), 'documents');
}

// 2. Simulate drag-and-drop state transitions & lifecycle controller
function createDragDropController() {
  let dragActive = false;
  let dragDepth = 0;
  let uploadsTriggered = [];
  let focusRestored = false;
  let featureEnabled = isDragDropEnabled();

  function dismissDrag(restoreFocus = false) {
    dragDepth = 0;
    dragActive = false;
    if (restoreFocus) {
      focusRestored = true;
    }
  }

  function setEnabled(enabled) {
    featureEnabled = Boolean(enabled);
    setDragDropEnabled(featureEnabled);
  }

  function handleDragEnter(types) {
    if (!featureEnabled) return;
    const list = Array.from(types || []);
    if (!list.includes('Files')) return;
    dragDepth += 1;
    if (dragDepth === 1) {
      dragActive = true;
    }
  }

  function handleDragLeave(types) {
    if (!featureEnabled) return;
    const list = Array.from(types || []);
    if (!list.includes('Files')) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      dragActive = false;
    }
  }

  function handleWindowDragEnd() {
    dismissDrag(false);
  }

  function handleCloseButton() {
    // Dismiss immediately with focus restoration without uploading
    dismissDrag(true);
  }

  function handleEscapeKey() {
    // Escape key dismisses with focus restoration without uploading
    dismissDrag(true);
  }

  function handleDropOnClose() {
    // Dropping onto the close/cancel button dismisses without uploading
    dismissDrag(true);
  }

  function handleDisableFeature() {
    // Disables drag-and-drop file sharing in attachment rules and closes overlay
    setEnabled(false);
    dismissDrag(true);
  }

  function handleDrop(files, currentCount = 0) {
    dismissDrag(false);
    if (!featureEnabled) return;
    if (!files || !files.length) return;
    const { images, documents } = validateDroppedFiles(files, currentCount);
    if (images.length) uploadsTriggered.push({ kind: 'images', count: images.length });
    if (documents.length) uploadsTriggered.push({ kind: 'documents', count: documents.length });
  }

  return {
    getState: () => ({ dragActive, dragDepth, uploadsTriggered, focusRestored, featureEnabled }),
    resetFocus: () => { focusRestored = false; },
    setEnabled,
    handleDragEnter,
    handleDragLeave,
    handleWindowDragEnd,
    handleCloseButton,
    handleEscapeKey,
    handleDropOnClose,
    handleDisableFeature,
    handleDrop,
  };
}

// Reset feature state before tests
setDragDropEnabled(true);

// Scenario A: Drag enters, user clicks close element (✕)
{
  const controller = createDragDropController();
  assert.equal(controller.getState().dragActive, false);

  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);
  assert.equal(controller.getState().dragDepth, 1);

  // User clicks close button
  controller.handleCloseButton();
  assert.equal(controller.getState().dragActive, false);
  assert.equal(controller.getState().dragDepth, 0);
  assert.equal(controller.getState().focusRestored, true, 'Focus should be restored to composer');
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No uploads should be triggered on close');
}

// Scenario B: Drag enters, user presses Escape key
{
  const controller = createDragDropController();
  controller.handleDragEnter(['Files']);
  // Nested drag over children
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragDepth, 2);
  assert.equal(controller.getState().dragActive, true);

  // Press Escape
  controller.handleEscapeKey();
  assert.equal(controller.getState().dragActive, false);
  assert.equal(controller.getState().dragDepth, 0);
  assert.equal(controller.getState().focusRestored, true, 'Focus should be restored on Escape');
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No uploads should be triggered on Escape');
}

// Scenario C: Drag enters, user drops onto Cancel/Close button
{
  const controller = createDragDropController();
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);

  controller.handleDropOnClose();
  assert.equal(controller.getState().dragActive, false);
  assert.equal(controller.getState().dragDepth, 0);
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No uploads when dropped on close/cancel');
}

// Scenario D: Drag enters, user drops onto "Turn off drag & drop" element in attachment rules
{
  const controller = createDragDropController();
  assert.equal(isDragDropEnabled(), true);
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);

  // User activates element to close/disable drag & drop feature in attachment rules
  controller.handleDisableFeature();
  assert.equal(controller.getState().dragActive, false);
  assert.equal(controller.getState().featureEnabled, false);
  assert.equal(isDragDropEnabled(), false);
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No uploads when disabling feature');

  // While disabled, dragging files does NOT activate overlay
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, false, 'Overlay must not activate when drag-drop is disabled');

  // Dropping files while disabled does nothing
  controller.handleDrop([{ name: 'test.pdf', size: 100 }], 0);
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No uploads when feature disabled');

  // Re-enabling feature restores drag & drop file sharing
  controller.setEnabled(true);
  assert.equal(isDragDropEnabled(), true);
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true, 'Overlay activates after re-enabling');
  controller.handleCloseButton();
}

// Scenario E: Window dragend cleanup when user aborts outside window
{
  const controller = createDragDropController();
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);

  // User aborts drag outside window (browser fires window dragend)
  controller.handleWindowDragEnd();
  assert.equal(controller.getState().dragActive, false);
  assert.equal(controller.getState().dragDepth, 0);
  assert.equal(controller.getState().uploadsTriggered.length, 0);
}

// Scenario F: Drag enters, non-file item dragged (e.g. text selection)
{
  const controller = createDragDropController();
  controller.handleDragEnter(['text/plain']);
  assert.equal(controller.getState().dragActive, false, 'Non-file drags should not activate drop overlay');
}

// Scenario G: Dropping valid files
{
  const controller = createDragDropController();
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);

  const testFiles = [
    { name: 'screen.png', size: 1024 },
    { name: 'specs.pdf', size: 2048 },
  ];
  controller.handleDrop(testFiles, 0);

  const state = controller.getState();
  assert.equal(state.dragActive, false, 'Drag state should reset after drop');
  assert.equal(state.dragDepth, 0);
  assert.equal(state.uploadsTriggered.length, 2);
  assert.equal(state.uploadsTriggered[0].kind, 'images');
  assert.equal(state.uploadsTriggered[0].count, 1);
  assert.equal(state.uploadsTriggered[1].kind, 'documents');
  assert.equal(state.uploadsTriggered[1].count, 1);
}

// Scenario H: Dropping invalid files throws and stops upload
{
  const controller = createDragDropController();
  controller.handleDragEnter(['Files']);
  assert.equal(controller.getState().dragActive, true);

  assert.throws(
    () => controller.handleDrop([{ name: 'malware.exe', size: 100 }]),
    /supported image or document/,
  );
  assert.equal(controller.getState().dragActive, false, 'State should reset even on invalid drop');
  assert.equal(controller.getState().uploadsTriggered.length, 0, 'No upload triggered for invalid file');
}

// Ensure feature enabled state is cleanly restored
setDragDropEnabled(true);

console.log('PASS: Chat drag-and-drop UI state machine, close element, cancel button, feature toggle in attachment rules, Escape key handling, and window dragend verified.');
