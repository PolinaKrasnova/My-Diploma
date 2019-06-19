import CodeFlask from "codeflask";
import plantUmlOptions from "./neweditor/options";

const fs = require("fs");
const path = require("path");
const mv = require("mv");
const fsExtra = require("fs-extra");

const app = new Vue({
  el: "#app",
  data: {
    workingFolder: null, // Путь до рабочей директории (открытого проекта)
    openedFile: null, // Путь до открытого файла
    diagramTypeCurDirectory: null, // Название каталога открытого файла
    files: [], // Список файлов директории
    sourceCode: "Редактирование доступно после открытия файла!",
    diagram: false, // Показывать диаграмму?
    comments: "", // Комментарии
    commentsUseCase: [], //Комментарии для use-case диаграмм
    lastCompile: "", // Дата последней компиляцияы
    imgOpened: null, // Какой файл изображения открыт? (base64)
    folders: {}, // Каталоги проекта (Ссылка из ProjectManager класса)
    projectFile: null, // Файл проекта
    newFileCatalog: null, // Каталог создания нового файла
    newFileName: "newFile.uml",

    showMoveMenu: false, // Показывать меню для перемещения
    folderToMove: "usecase",
    editor: null, // Объект код-эдитора,
    descriptionBox: false, // Определяет - показывать панель описания или нет
    descriptionBoxType: 0, // Тип блока описания

    formUseCaseComments: {
      input1: "",
      input2: "",
      input3: "",
      input4: "",
      input5: "",
      input6: ""
    }
  },
  mounted() {},
  methods: {
    deleteUseCaseDescriptionElement(id) {
      this.commentsUseCase.splice(id, 1);
    },
    addUseCaseDescription() {
      this.commentsUseCase.push(this.formUseCaseComments);
      this.formUseCaseComments = {
        input1: "",
        input2: "",
        input3: "",
        input4: "",
        input5: "",
        input6: ""
      };
    },
    deleteFile() {
      const flag = confirm(
        `Вы действительно хотите удалить ${
          this.openedFile
        } вместе с диаграммой?`
      );
      if (flag) {
        if (
          fs.existsSync(
            `${app.workingFolder}/${app.diagramTypeCurDirectory}/${
              app.openedFile
            }.jpg`
          )
        ) {
          fs.unlinkSync(
            `${app.workingFolder}/${app.diagramTypeCurDirectory}/${
              app.openedFile
            }.jpg`
          );
        }
        fs.unlinkSync(
          `${app.workingFolder}/${app.diagramTypeCurDirectory}/${
            app.openedFile
          }`
        );
        delete Settings.descriptionDiagrams[
          `${app.diagramTypeCurDirectory}/${app.openedFile}`
        ];
        app.commentsUseCase = [];
        app.comments = "";
        Settings.saveProject();
        refreshFolder();
        this.openedFile = null;
        alert("Файл удален");
      } else {
      }
    },
    moveFile(e) {
      if (this.diagramTypeCurDirectory === this.folderToMove) {
        console.log("Нельзя переместить в туже директорию");
        return;
      }
      if (
        fs.existsSync(
          `${app.workingFolder}/${app.folderToMove}/${app.openedFile}`
        )
      ) {
        if (!confirm("Вы действительно хотите перезаписать файл?")) {
          return;
        }
      }
      console.log("Удаление описания...");
      delete Settings.descriptionDiagrams[
        `${app.diagramTypeCurDirectory}/${app.openedFile}`
      ];
      fsExtra.moveSync(
        `${app.workingFolder}/${app.diagramTypeCurDirectory}/${app.openedFile}`,
        `${app.workingFolder}/${app.folderToMove}/${app.openedFile}`,
        { overwrite: true }
      );
      if (
        fs.existsSync(
          `${app.workingFolder}/${app.diagramTypeCurDirectory}/${
            app.openedFile
          }.jpg`
        )
      ) {
        console.log("Перенос изображения диаграммы...");
        fsExtra.moveSync(
          `${app.workingFolder}/${app.diagramTypeCurDirectory}/${
            app.openedFile
          }.jpg`,
          `${app.workingFolder}/${app.folderToMove}/${app.openedFile}.jpg`
        );
      }
      this.openFile(app.openedFile, app.folderToMove);
      refreshFolder();
    },
    toggleMoveMenu() {
      this.showMoveMenu = !this.showMoveMenu;
    },
    toggleDescriptionBox() {
      this.descriptionBox = !this.descriptionBox;
    },
    generateReport: () => {
      Settings.generateReport();
    },
    fullCompilation: () => {
      alert("Процесс компиляции всех исходников начат");
      Settings.fullCompilation();
    },
    chooseDirCreateFile: catalogName => {
      app.newFileCatalog = catalogName;
      console.log(`Каталог создания файла изменен на ${app.newFileCatalog}`);
    },
    closeImg: () => {
      app.imgOpened = null;
    },
    openFile(fileName, catalog = "") {
      const m_fileName = `${catalog}/${fileName}`;
      if (path.extname(fileName) === ".jpg") {
        const imgStream = fs.readFileSync(`${app.workingFolder}/${m_fileName}`);
        // fs.closeSync(`${app.workingFolder}/${m_fileName}`);
        const buffer = Buffer.from(imgStream).toString("base64");
        app.imgOpened = `data:image/jpeg;base64,${buffer}`;
        return;
      }
      if (
        path.extname(fileName) !== ".txt" &&
        path.extname(fileName) !== ".uml"
      ) {
        alert("Поддерживается только открытие файлов txt и uml");
        return;
      }
      app.openedFile = fileName;
      app.diagramTypeCurDirectory = catalog;
      let sourceK = "";
      try {
        sourceK = fs.readFileSync(
          `${app.workingFolder}/${app.diagramTypeCurDirectory}/${fileName}`
        );
      } catch (e) {
        alert("Произошла ошибка открытия файла");
        return;
      }
      // app.sourceCode = sourceK;
      console.log(sourceK.toString());
      app.commentsUseCase = [];
      app.comments = "";
      if (
        Settings.descriptionDiagrams[app.diagramTypeCurDirectory][
          app.openedFile
        ]
      ) {
        if (app.diagramTypeCurDirectory === "usecase") {
          console.log("192");
          app.commentsUseCase =
            Settings.descriptionDiagrams[app.diagramTypeCurDirectory][
              app.openedFile
            ];
        } else
          app.comments =
            Settings.descriptionDiagrams[app.diagramTypeCurDirectory][
              app.openedFile
            ];
      }
      this.editor = new CodeFlask("#codeFlaskEditor", {
        language: "plantuml",
        lineNumbers: true
      });
      this.editor.addLanguage("plantuml", plantUmlOptions);
      this.editor.updateCode(sourceK.toString());
    },
    saveFile() {
      let code = "";
      if (this.editor) {
        code = this.editor.getCode();
      }
      fs.writeFileSync(
        `${app.workingFolder}/${app.diagramTypeCurDirectory}/${app.openedFile}`,
        code
      );
      if (this.diagramTypeCurDirectory === "usecase")
        Settings.descriptionDiagrams[app.diagramTypeCurDirectory][
          app.openedFile
        ] = app.commentsUseCase;
      else
        Settings.descriptionDiagrams[app.diagramTypeCurDirectory][
          app.openedFile
        ] = app.comments;
      console.log("SETTINGS DESCRIPTIONS");
      console.log(Settings.descriptionDiagrams);
      Settings.saveProject();
      alert("Файл записан");
      refreshFolder();
    },
    async compile() {
      if (this.diagramTypeCurDirectory == 'usecase')
        if (this.commentsUseCase.length <=0) {
          alert('У вас не описаны прецеденты. Компиляция прервана.')
          return;
        }
      app.saveFile();
      app.closeImg();
      Compiler.compile(
        `${app.workingFolder}/${app.diagramTypeCurDirectory}/${app.openedFile}`
      );
      alert("Скомпилированно");
      refreshFolder();
      app.lastCompile = new Date().toISOString();
      app.closeImg();
      app.openFile(`${app.openedFile}.jpg`, app.diagramTypeCurDirectory);
    },
    createFile() {
      if (app.newFileName === "") {
        alert("Пустое имя файла");
        return;
      }
      fs.writeFileSync(
        `${app.workingFolder}/${app.newFileCatalog}/${app.newFileName}`,
        ""
      );
      app.openedFile = `${app.workingFolder}/${app.newFileCatalog}/${
        app.newFileName
      }`;
      // app.sourceCode = '';
      // this.editor.updateCode('');
      app.newFileName = "";
      if (this.editor) {
        this.editor.updateCode("");
      }
      refreshFolder();
    }
  }
});
