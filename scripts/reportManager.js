const electron = require('electron');
const {ipcRenderer} = electron;

const oneHour = 3600000;
const oneMinute = 60000;

class reportManager {

    constructor(settings) {
        this.settings = settings;
        this.taskField = document.getElementById('task-input');
        this.durationField = document.getElementById('duration-input');
        this.reportField = document.getElementById('report-input');
        this.dateField = document.getElementById('date-input');

        this.startNewDay();
        fillSelect(this.taskField, settings.projects);
        ipcRenderer.send('mainWindow:hide', {});
    }

    startNewDay() {
        this._start_day = new Date();
        this.trackedCounter = 0;
        // need update worked time indicator
        // this.workedTime.Text = "00:00";

        this.resetFields();

        if(this.minuteTimer) {
            clearInterval(this.minuteTimer);
        }

        this.minuteTimer = setInterval(this.updateMinute.bind(this), oneMinute);
    }

    resetFields() {
        this.durationField.value = "1.0";
        this.reportField.value = "";
        this.dateField.value = formatDate(this._start_day);

        this._start_task = new Date();

        if(this.notificationTimer) {
            clearInterval(this.notificationTimer);
        }

        const notificationInterval = this.settings.notificationTime * oneHour;
        this.notificationTimer = setInterval(this.notifyUser.bind(this), notificationInterval);

        // need update tracked time indicator from this.trackedCounter
        // this.trackedTime.Text = this.trackedCounter.ToString();
    }

    getReport() {
        const reportTask = this.taskField.value;
        const reportDuration = this.durationField.value;
        const reportText = this.reportField.value;
        const reportDate = this.dateField.value;
    
        return [reportTask, reportDuration, reportText, reportDate, reportDate];
    }

    updateMinute() {
        const elapsed = new Date() - this._start_task;
        this.durationField.value = roundNumber(elapsed / oneHour);
        const elapsed_day = new Date() - this._start_day;
        // update this.workedTime from elapsed_day/oneHour
        console.log("updateMinute");
        ipcRenderer.send('mainWindow:show', {});
    }
    
    notifyUser() {
        ipcRenderer.send('mainWindow:show', {});
        // set focus
        const elapsed = new Date() - this._start_task;
        this.durationField.value = roundNumber(elapsed / oneHour);
        const elapsed_day = new Date() - this._start_day;
        // update this.workedTime from elapsed_day
        console.log("notifyUser");
    }
}

function formatDate(date) {
    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let yy = date.getFullYear();

    return mm + '/' + dd + '/' + yy;
}

function roundNumber(number) {
    return number.toFixed(2);
}

function fillSelect(selectField, projects) {
    const projectNames = projects.filter(project => project.enabled).map(project => project.name);

    projectNames.forEach(projectName => {
        let option = document.createElement("option");
        option.value = projectName;
        option.text = projectName;
        selectField.appendChild(option);
    });
}