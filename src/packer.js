const docx = require("docx");
var sizeOf = require("image-size");
const word2pdf = require("word2pdf");

const Settings = {
  compilingFiles: {
    usecase: [],
    robustness: [],
    sequence: [],
    class: []
  },
  descriptionDiagrams: {
    usecase: {},
    robustness: {},
    sequence: {},
    class: {}
  },
  async fullCompilation() {
    // Компиляция всех диаграмм.
    for (let i = 0; i < ProjectManager.iconixFolders.length; i++) {
      for (
        let j = 0;
        j < app.folders[ProjectManager.iconixFolders[i]].length;
        j++
      ) {
        const filePath = `${app.workingFolder}/${
          ProjectManager.iconixFolders[i]
        }/${app.folders[ProjectManager.iconixFolders[i]][j]}`;
        if (path.extname(filePath) === ".uml") {
          Compiler.compile(filePath);
        }
      }
      refreshFolder();
      console.log(app.folders[ProjectManager.iconixFolders[i]]);
    }
  },
  generateReport: async (format = "doc") => {
    alert(
      "Перед созданием отчета необходимо произвести полную компиляцию проекта..."
    );
    Settings.fullCompilation();
    alert("Генерация отчета...");
    const doc = new docx.Document();
    const text = new docx.TextRun(`Диаграмма usecase`);
    const paragraph = new docx.Paragraph();

    paragraph.addRun(text);
    doc.addParagraph(paragraph);
    /*
        Generation for usecase diagrams
      */
    for (var key in Settings.descriptionDiagrams.usecase) {
      console.log("file:...", key);
      const filePath = `${app.workingFolder}/usecase/${key}.jpg`;
      if (path.extname(filePath) === ".jpg") {
        // Эти изображения кладем в отчет
        try {
          var dimensions = sizeOf(filePath);
          console.log(dimensions.width, dimensions.height);
          doc.createImage(
            fs.readFileSync(filePath),
            dimensions.width,
            dimensions.height
          );
        } catch (e) {
          console.log(
            `Файл ${filePath} не найден. Возможно,вы не делал компиляцию диаграммы?`
          );
        }
      }
      //Ложить программу,если прецедентов нет хотя бы у одного usecase файла
      if ( Settings.descriptionDiagrams.usecase[key].length === 0) {
        alert(`Для диаграммы ${app.workingFolder}/usecase/${key} не описано ни одного прецедента `)
        return;
      }
      doc.addParagraph(new docx.Paragraph("Описание прецедентов"));
      for (var itemIn in Settings.descriptionDiagrams.usecase[key]) {
        doc.addParagraph(
          new docx.Paragraph(
            "Название прецедента: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input1
          )
        );
        doc.addParagraph(
          new docx.Paragraph(
            "Предусловие: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input2
          )
        );
        doc.addParagraph(
          new docx.Paragraph(
            "Цель сценария: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input3
          )
        );
        doc.addParagraph(
          new docx.Paragraph(
            "Основной сценарий: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input4
          )
        );
        doc.addParagraph(
          new docx.Paragraph(
            "Постусловия: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input5
          )
        );
        doc.addParagraph(
          new docx.Paragraph(
            "Условия ввода и действие и действие альтернативных сценариев: " +
              Settings.descriptionDiagrams.usecase[key][itemIn].input6
          )
        );
        doc.addParagraph(new docx.Paragraph());
      }
    }
    //ROBUSTNESS
    doc.addParagraph(new docx.Paragraph("Диаграммы Robustness"));
    for (var key in Settings.descriptionDiagrams.robustness) {
      const filePath = `${app.workingFolder}/robustness/${key}.jpg`;
      if (path.extname(filePath) === ".jpg") {
        try {
          var dimensions = sizeOf(filePath);
          console.log(dimensions.width, dimensions.height);
          doc.createImage(
            fs.readFileSync(filePath),
            dimensions.width,
            dimensions.height
          );
        } catch (e) {
          alert(
            `Файл ${filePath} не найден. Возможно,вы не делал компиляцию диаграммы?`
          );
        }
      }
      doc.addParagraph(new docx.Paragraph("Описание"));
      doc.addParagraph(
        new docx.Paragraph(Settings.descriptionDiagrams.robustness[key])
      );
    }
    //Sequence

    doc.addParagraph(new docx.Paragraph("Диаграммы Sequence"));
    for (var key in Settings.descriptionDiagrams.sequence) {
      const filePath = `${app.workingFolder}/sequence/${key}.jpg`;
      if (path.extname(filePath) === ".jpg") {
        try {
          var dimensions = sizeOf(filePath);
          console.log(dimensions.width, dimensions.height);
          doc.createImage(
            fs.readFileSync(filePath),
            dimensions.width,
            dimensions.height
          );
        } catch (e) {
          alert(
            `Файл ${filePath} не найден. Возможно,вы не делал компиляцию диаграммы?`
          );
        }
      }
      doc.addParagraph(new docx.Paragraph("Описание"));
      doc.addParagraph(
        new docx.Paragraph(Settings.descriptionDiagrams.sequence[key])
      );
    }
    //classes

    doc.addParagraph(new docx.Paragraph("Диаграммы Class"));
    for (var key in Settings.descriptionDiagrams.class) {
      const filePath = `${app.workingFolder}/class/${key}.jpg`;
      if (path.extname(filePath) === ".jpg") {
        try {
          var dimensions = sizeOf(filePath);
          console.log(dimensions.width, dimensions.height);
          doc.createImage(
            fs.readFileSync(filePath),
            dimensions.width,
            dimensions.height
          );
        } catch (e) {
          alert(
            `Файл ${filePath} не найден. Возможно,вы не делал компиляцию диаграммы?`
          );
        }
      }
      doc.addParagraph(new docx.Paragraph("Описание"));
      doc.addParagraph(
        new docx.Paragraph(Settings.descriptionDiagrams.class[key])
      );
    }

    const packer = new docx.Packer();
    await packer.toBuffer(doc).then(buffer => {
      try {
        fs.writeFileSync(`${app.workingFolder}/report.docx`, buffer);
      } catch (e) {
        alert("Ошибка записи. Возможно ,файл открыт");
      }
    });
    refreshFolder();
    const pdfData = await word2pdf(`${app.workingFolder}/report.docx`);
    fs.writeFileSync(`${app.workingFolder}/report.pdf`, pdfData);
    alert("Отчет создан. Название файла отчета: report.docx и report.pdf");
  },
  saveProject: () => {
    let saveObj = {
      usecase: Settings.descriptionDiagrams.usecase,
      robustness: Settings.descriptionDiagrams.robustness,
      sequence: Settings.descriptionDiagrams.sequence,
      class: Settings.descriptionDiagrams.class
    };

    console.log(saveObj);
    console.log(JSON.stringify(saveObj));
    fs.writeFileSync(
      `${app.workingFolder}/project.umlProject`,
      JSON.stringify(saveObj)
    );
  },
  openProject: workPath => {
    console.log("Fileproject loaded:");
    const settings = fs.readFileSync(`${workPath}/project.umlProject`);
    const resObj = JSON.parse(settings);
    console.log("ПАРСИНГ!!!");
    console.log(resObj);
    Settings.descriptionDiagrams = resObj;
    // console.log(compilingFiles);
    // console.log(descriptionDiagrams);
  }
};
