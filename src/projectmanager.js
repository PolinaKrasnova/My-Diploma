const refreshFolder = () => {
  for (let i = 0; i < ProjectManager.iconixFolders.length; i++) {
    const tmp = fs
      .readdirSync(`${app.workingFolder}/${ProjectManager.iconixFolders[i]}`)
      .filter(el => !el.isDirectory);
    ProjectManager.folders[`${ProjectManager.iconixFolders[i]}`] = tmp;
  }
  console.log(ProjectManager.folders);
};

const ProjectManager = {
  iconixFolders: ["usecase", "robustness", "sequence", "class"],
  openProject: event => {
    const workPath = event.srcElement.files[0].path;
    app.projectFile = "project.umlProject";
    if (!fs.existsSync(`${workPath}/${app.projectFile}`)) {
      fs.writeFileSync(
        `${workPath}/${app.projectFile}`,
        JSON.stringify({
          usecase: {},
          robustness: {},
          sequence: {},
          class: {}
        })
      );
    } else {
      Settings.openProject(workPath);
    }
    app.workingFolder = event.srcElement.files[0].path;
    // Check if project file exists and create if doesnt exist
    for (let i = 0; i < ProjectManager.iconixFolders.length; i++) {
      if (!fs.existsSync(`${workPath}/${ProjectManager.iconixFolders[i]}`)) {
        fs.mkdirSync(`${workPath}/${ProjectManager.iconixFolders[i]}`);
      }
    }
    // Check every of
    refreshFolder();
    app.folders = ProjectManager.folders;
  },
  folders: {
    usecase: {},
    robustness: {},
    sequence: {},
    class: {}
  }
};

// ProjectManager.openProject({
//   srcElement: { files: [{ path: "C:\\Users\\User\\Desktop\\umlnewtest" }] }
// });
