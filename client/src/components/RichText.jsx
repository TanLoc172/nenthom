import { useRef, useEffect } from 'react';

// Lightweight rich-text editor (no external deps) using contentEditable + execCommand.
// value/onChange work with an HTML string.
export default function RichText({ value = '', onChange }) {
  const ref = useRef(null);

  // Sync external value in only when it differs and the editor isn't focused
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const cmd = (command, arg) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    onChange?.(ref.current?.innerHTML || '');
  };

  const addLink = () => {
    const url = prompt('Nhập URL liên kết:');
    if (url) cmd('createLink', url);
  };

  const Btn = ({ act, arg, label, title }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={() => cmd(act, arg)}
      style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        <Btn act="bold" label="B" title="Đậm" />
        <Btn act="italic" label="I" title="Nghiêng" />
        <Btn act="underline" label="U" title="Gạch chân" />
        <Btn act="formatBlock" arg="h2" label="H2" title="Tiêu đề lớn" />
        <Btn act="formatBlock" arg="h3" label="H3" title="Tiêu đề nhỏ" />
        <Btn act="formatBlock" arg="p" label="¶" title="Đoạn văn" />
        <Btn act="insertUnorderedList" label="• List" title="Danh sách" />
        <Btn act="insertOrderedList" label="1. List" title="Danh sách số" />
        <button type="button" title="Liên kết" onMouseDown={(e) => e.preventDefault()} onClick={addLink}
          style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }}>🔗</button>
        <Btn act="removeFormat" label="✕ Format" title="Xoá định dạng" />
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
        style={{
          border: '1px solid var(--border)', borderRadius: 8, padding: 12,
          minHeight: 220, background: '#fff', lineHeight: 1.6, outline: 'none',
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}
