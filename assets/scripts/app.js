class DOMHalper {
  static clearEventListener(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }

  static movElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }

    this.insertBefore = insertBefore;
  }

  detach() {
    if (this.element) {
      this.element.remove();
    }
  }

  attach() {
    //document.body.append(this.element);
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? "beforebegin" : "beforeend",
      this.element
    );
  }
}

class Tootip extends Component {
  constructor(closeNotifierFunction) {
    super("active-projects");
    this.closeNottifier = closeNotifierFunction;
    this.create();
  }

  closeTooltip = () => {
    this.detach();
    this.closeNottifier();
  };

  create() {
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";
    tooltipElement.textContent = "DUMMY";
    tooltipElement.addEventListener("click", this.closeTooltip);
    this.element = tooltipElement;
  }
}

class ProjectItem extends Component {
  hasActiveTooltip = false;

  constructor(id, updateProjectListsFunction, type) {
    super();
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;
    //this event in which we will use for MoreInfo btn
    this.connectMoreInfoButton();
    //this event in which we will use for btn eventlisnter
    this.connectSwitchButton(type);
  }
  //in this class we will implemant every thing
  //should work in the single item

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const tootip = new Tootip(() => {
      this.hasActiveTooltip = false;
    });
    tootip.attach();
    this.hasActiveTooltip = true;
  }

  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    console.log;
    const InfoBtn = projectItemElement.querySelector("button:first-of-type");
    InfoBtn.addEventListener("click", this.showMoreInfoHandler);
  }

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    //const switchBtn = document.querySelector(`#${this.id} .alt + button`);
    let switchBtn = projectItemElement.querySelector("button:last-of-type");
    switchBtn = DOMHalper.clearEventListener(switchBtn);
    switchBtn.textContent = type === "active" ? "Finish" : "Activate";
    //console.log(switchBtn);
    switchBtn.addEventListener(
      "click",
      this.updateProjectListsHandler.bind(null, this.id)
    );
  }

  update(updateProjectListsFn, type) {
    this.updateProjectListsHandler = updateProjectListsFn;
    this.connectSwitchButton(type);
  }
}

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    for (const prjItem of prjItems) {
      //here we pass each element sepreatedly
      //to the projectItem
      this.projects.push(
        new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
      );
    }
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
    console.log(project);
    //console.log(this.type);
    this.projects.push(project);
    DOMHalper.movElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    // this.addProject(); ==> this will not work fro that we use functionHandler
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    //const projectIndex = this.projects.findIndex((p) => p.id === projectId);
    //this.projects.splice(projectIndex, 1);
    //another way to implemant the above code
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  //we make it static because we will use it just for call
  static init() {
    const activeProjectsList = new ProjectList("active");
    const finishedProjectsList = new ProjectList("finished");
    activeProjectsList.setSwitchHandlerFunction(
      finishedProjectsList.addProject.bind(finishedProjectsList)
    );

    finishedProjectsList.setSwitchHandlerFunction(
      activeProjectsList.addProject.bind(activeProjectsList)
    );
  }
}

App.init();
