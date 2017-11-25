const oneHour = 3600000;
const oneMinute = 60000;

class reportManager {

    constructor(settings) {
        this.settings = settings;
        this.taskField = document.getElementById('task-input');
        this.durationField = document.getElementById('duration-input');
        this.reportField = document.getElementById('report-input');
        this.dateField = document.getElementById('date-input');

        this.workedFirstHour = document.querySelectorAll('.first-hour');
        this.workedSecondHour = document.querySelectorAll('.second-hour');
        this.workedFirstMinute = document.querySelectorAll('.first-minute');
        this.workedSecondMinute = document.querySelectorAll('.second-minute');

        this.startNewDay();
        fillSelect(this.taskField, settings.projects);
    }

    startNewDay() {
        this._start_day = new Date();
        this._updateWorkedTime("0", "0");

        this.resetFields();

        if(this.minuteTimer) {
            clearInterval(this.minuteTimer);
        }

        this.minuteTimer = setInterval(this._updateMinute.bind(this), oneMinute);
    }

    resetFields() {
        this.durationField.value = this.settings.notificationTime;
        this.reportField.value = "";
        this.dateField.value = formatDate(this._start_day);

        this._start_task = new Date();

        if(this.notificationTimer) {
            clearInterval(this.notificationTimer);
        }

        const notificationInterval = this.settings.notificationTime * oneHour;
        this.notificationTimer = setInterval(this._notifyUser.bind(this), notificationInterval);

        getStatistics().then(statObj => {
            this.statistics = statObj;
            this._updateTrackedTime();
        });
    }

    getReport() {
        const reportTask = this.taskField.value;
        const reportDuration = parseFloat(this.durationField.value);
        const reportText = this.reportField.value;
        const reportDate = new Date(this.dateField.value);
    
        return [reportTask, reportDuration, reportText, reportDate, reportDate];
    }

    _updateMinute() {
        const elapsed = new Date() - this._start_task;
        this.durationField.value = roundNumber(elapsed / oneHour);

        const elapsed_day = new Date() - this._start_day;
        const workedHours = Math.floor(elapsed_day / oneHour);
        const workedMinutes = Math.round((elapsed_day % oneHour) / oneMinute);

        this._updateWorkedTime(workedHours.toString(), workedMinutes.toString());
    }
    
    _notifyUser() {
        ipcRenderer.send('mainWindow:show', {});
        this.reportField.focus();

        const elapsed = new Date() - this._start_task;
        this.durationField.value = roundNumber(elapsed / oneHour);

        const elapsed_day = new Date() - this._start_day;
        const workedHours = Math.floor(elapsed_day / oneHour);
        const workedMinutes = Math.round((elapsed_day % oneHour) / oneMinute);
        
        this._updateWorkedTime(workedHours.toString(), workedMinutes.toString());
    }

    _updateWorkedTime(workedHours, workedMinutes) {
        let firstHour = "0";
        let secondHour = workedHours[0];

        if(workedHours.length > 1) {
            firstHour = workedHours[0];
            secondHour = workedHours[1];
        }

        let firstMinute = "0";
        let secondMinute = workedMinutes[0];

        if(workedMinutes.length > 1) {
            firstMinute = workedMinutes[0];
            secondMinute = workedMinutes[1];
        }

        this._updateWorkedDigit(this.workedFirstHour, firstHour);
        this._updateWorkedDigit(this.workedSecondHour, secondHour);
        this._updateWorkedDigit(this.workedFirstMinute, firstMinute);
        this._updateWorkedDigit(this.workedSecondMinute, secondMinute);
    }

    _updateWorkedDigit(digitElements, digitValue) {
        digitElements.forEach(element => {
            element.innerHTML = digitValue;
        });
    }

    _updateTrackedTime() {
        const trackedDay = ((100 * this.statistics.TodayEffort) / this.settings.workTime) || 0.1;
        const trackedWeek = ((100 * this.statistics.WeekEffort) / (this.settings.workTime * 5)) || 0.1;

        const y = this._start_day.getFullYear(), m = this._start_day.getMonth();
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        const daysInMonth = moment().isoWeekdayCalc(firstDay, lastDay, [1,2,3,4,5]);
        const trackedMonth = ((100 * this.statistics.MonthEffort) / (this.settings.workTime * daysInMonth)) || 0.1;

        progress.update([(Math.round( trackedDay * 10 ) / 10), trackedWeek, trackedMonth]);
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
    return number.toFixed(1);
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