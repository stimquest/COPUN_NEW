'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback, useState } from 'react';

interface RichTextEditorProps {
    value: string;            // HTML
    onChange: (html: string) => void;
    placeholder?: string;
}

function ToolbarButton({
    onClick, active, disabled, icon, label,
}: { onClick: () => void; active?: boolean; disabled?: boolean; icon: string; label: string }) {
    return (
        <button
            type="button"
            onMouseDown={e => e.preventDefault()} // garde le focus dans l'éditeur
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`size-9 rounded-lg flex items-center justify-center transition disabled:opacity-30 ${
                active ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </button>
    );
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-teal-600 underline', rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'rounded-xl max-w-full my-2' },
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: 'prose prose-slate prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
            },
        },
    });

    // Saisie inline (remplace window.prompt, non supporté par Next 16)
    const [inputMode, setInputMode] = useState<'link' | 'image' | null>(null);
    const [inputValue, setInputValue] = useState('');

    const openLink = useCallback(() => {
        if (!editor) return;
        const previous = editor.getAttributes('link').href as string | undefined;
        setInputValue(previous ?? 'https://');
        setInputMode('link');
    }, [editor]);

    const openImage = useCallback(() => {
        setInputValue('https://');
        setInputMode('image');
    }, []);

    const confirmInput = () => {
        if (!editor) return;
        const url = inputValue.trim();
        if (inputMode === 'link') {
            if (url === '' || url === 'https://') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
            } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
        } else if (inputMode === 'image' && url && url !== 'https://') {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setInputMode(null);
        setInputValue('');
    };

    const cancelInput = () => { setInputMode(null); setInputValue(''); };

    if (!editor) return null;

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-400 transition">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
                <ToolbarButton label="Titre" icon="title" active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
                <ToolbarButton label="Sous-titre" icon="format_h3" active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ToolbarButton label="Gras" icon="format_bold" active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()} />
                <ToolbarButton label="Italique" icon="format_italic" active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()} />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ToolbarButton label="Liste à puces" icon="format_list_bulleted" active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()} />
                <ToolbarButton label="Liste numérotée" icon="format_list_numbered" active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                <ToolbarButton label="Citation" icon="format_quote" active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} />
                <div className="w-px h-5 bg-slate-200 mx-1" />
                <ToolbarButton label="Lien" icon="link" active={editor.isActive('link')} onClick={openLink} />
                <ToolbarButton label="Image (par URL)" icon="image" onClick={openImage} />
            </div>

            {/* Barre de saisie inline (lien / image) */}
            {inputMode && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-teal-50/50">
                    <span className="material-symbols-outlined text-[18px] text-teal-600">
                        {inputMode === 'link' ? 'link' : 'image'}
                    </span>
                    <input
                        autoFocus
                        type="url"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); confirmInput(); }
                            if (e.key === 'Escape') { e.preventDefault(); cancelInput(); }
                        }}
                        placeholder={inputMode === 'link' ? 'https://… (vide pour retirer le lien)' : "URL de l'image (lien externe)"}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                    <button type="button" onClick={confirmInput}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition">
                        OK
                    </button>
                    <button type="button" onClick={cancelInput}
                        className="size-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}

            {/* Zone d'édition */}
            <div className="relative">
                <EditorContent editor={editor} />
                {editor.isEmpty && placeholder && (
                    <p className="absolute top-3 left-4 text-slate-300 pointer-events-none text-sm">{placeholder}</p>
                )}
            </div>
        </div>
    );
}
