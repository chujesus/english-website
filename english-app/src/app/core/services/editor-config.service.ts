import { Injectable } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Injectable({
    providedIn: 'root'
})
export class EditorConfigService {

    constructor() { }

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '30vh',
        maxHeight: 'auto',
        width: '100%',
        minWidth: '100%',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
        ],
        customClasses: [
            {
                name: 'quote',
                class: 'quote',
            },
            {
                name: 'redText',
                class: 'redText'
            },
            {
                name: 'titleText',
                class: 'titleText',
                tag: 'h1',
            },
        ],
        uploadUrl: 'v1/image',
        uploadWithCredentials: false,
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            [
                'subscript',
                'superscript',
            ],
            [
                'customClasses',
                'toggleEditorMode'
            ]
        ]
    };
}