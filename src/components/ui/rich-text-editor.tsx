'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface TinyMCEEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  onEditorChange?: (content: string) => void;
  height?: number | string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value = '',
  onChange,
  onEditorChange,
  height = 500,
  disabled = false,
  readOnly = false,
  error = false
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const handleEditorChange = (content: string) => {
    if (onChange) {
      onChange(content);
    }
    if (onEditorChange) {
      onEditorChange(content);
    }
  };

  return (
    <Editor
      onInit={(evt, editor) => {
        editorRef.current = editor;
      }}
      value={value}
      onEditorChange={handleEditorChange}
      disabled={disabled || readOnly}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | code |',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
      tinymceScriptSrc="/tinymce/tinymce.min.js"
    />
  );
};

export default TinyMCEEditor;