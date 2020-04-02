const { ipcRenderer } = electron;

const oneHour = 3600000;
const oneMinute = 60000;

class reportManager {

    constructor(settings) {
        this.settings = settings;
        this.taskField = document.getElementById('task-input');
        this.durationField = document.getElementById('duration-input');
        this.reportField = document.getElementById('report-input');
        this.dateField = document.getElementById('date-input');

        this.pauseButtonIcon = document.getElementById('pauseButton-icon');
        this.saveButton = document.getElementById('save-button');
        this.restartButton = document.getElementById('restart-button');
        this.minimizeButton = document.getElementById('minimize-button');

        this.workedFirstHour = document.querySelectorAll('.first-hour');
        this.workedSecondHour = document.querySelectorAll('.second-hour');
        this.workedFirstMinute = document.querySelectorAll('.first-minute');
        this.workedSecondMinute = document.querySelectorAll('.second-minute');

        this.startNewDay();
        fillSelect(this.taskField, settings.projects);
    }

    startNewDay() {
        const timestamp = new Date(this.settings.timeStamp);
        const timestampDate = "" + timestamp.getDay() + timestamp.getMonth() + timestamp.getFullYear();
        const nowTime = new Date();
        const nowDate = "" + nowTime.getDay() + nowTime.getMonth() + nowTime.getFullYear();
        if (timestampDate != nowDate) {
            this.settings.timeStamp = nowTime;
            ipcRenderer.send('settings:save', [this.settings, true]);
        }

        this._start_day = new Date(this.settings.timeStamp);
        this._workDaysInMonth = getWorkDaysInMonth(this._start_day);

        this._updateWorkedTime();
        this.resetFields();

        if (this.minuteTimer) {
            clearInterval(this.minuteTimer);
        }

        this.minuteTimer = setInterval(this._updateMinute.bind(this), oneMinute);
    }

    resetFields() {
        this.reportField.value = "";
        this.dateField.value = formatDate(this._start_day);

        if (this.notificationTimer) {
            clearInterval(this.notificationTimer);
        }

        const notificationInterval = this.settings.notificationTime * oneHour;
        this.notificationTimer = setInterval(this._notifyUser.bind(this), notificationInterval);

        getStatistics().then(statObj => {
            this.statistics = statObj;
            this._updateDurationField();
            this._updateTrackedTime();
        });
    }

    getReport() {
        const reportTask = this.taskField.value;
        const reportDuration = parseFloat(this.durationField.value);
        const reportText = this.reportField.value;
        const reportDate = new Date(this.dateField.value + ' 12:00');

        return [reportTask, reportDuration, reportText, reportDate];
    }

    neuralReport(str) {
        this.reportField.value = str;
    }

    pause() {
        this.isPaused = !this.isPaused;
        this._changeDisablingState(this.isPaused);

        if(this.isPaused){
            this.pauseButtonIcon.classList.add('fa-play');
            this.pauseButtonIcon.classList.remove('fa-pause');

            this._startPause();
        } else {
            this.pauseButtonIcon.classList.add('fa-pause');
            this.pauseButtonIcon.classList.remove('fa-play');

            this._endPause();
        }
    }

    _updateMinute() {
        this._updateDurationField();;
        this._updateWorkedTime();
    }

    _notifyUser() {
        ipcRenderer.send('mainWindow:show', {});
        this.reportField.focus();

        this._updateMinute();
    }

    _updateWorkedTime() {
        const elapsed_day = new Date() - this._start_day;
        let workedHours = Math.floor(elapsed_day / oneHour);
        let workedMinutes = Math.round((elapsed_day % oneHour) / oneMinute);

        // TODO fix by other way
        if (workedMinutes === 60) {
            workedHours += 1;
            workedMinutes = 0;
        }

        workedHours = workedHours.toString();
        workedMinutes = workedMinutes.toString();

        let firstHour = "0";
        let secondHour = workedHours[0];

        if (workedHours.length > 1) {
            firstHour = workedHours[0];
            secondHour = workedHours[1];
        }

        let firstMinute = "0";
        let secondMinute = workedMinutes[0];

        if (workedMinutes.length > 1) {
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
        const trackedMonth = ((100 * this.statistics.MonthEffort) / (this.settings.workTime * this._workDaysInMonth)) || 0.1;

        progress.update([trackedDay, trackedWeek, trackedMonth]);
        
        $(".rbc-center-text > tspan").text(roundNumber(this.statistics.TodayEffort).toString());
    }

    _updateDurationField() {
        const elapsed_day = new Date() - this._start_day;
        const workedTime = roundNumber(elapsed_day / oneHour);
        const durationTime = workedTime - this.statistics.TodayEffort;

        this.durationField.value = durationTime >= 0 ? roundNumber(durationTime) : "0";
    }

    _startPause() {
        this._start_pause = new Date();

        if (this.minuteTimer) {
            clearInterval(this.minuteTimer);
        }

        if (this.notificationTimer) {
            clearInterval(this.notificationTimer);
        }
    }

    _endPause() {
        const newDate = new Date();
        if (newDate.getDate() === this._start_pause.getDate())
        {
            const pauseDuration = newDate - this._start_pause;
            const newStartDay = this._start_day.getTime() + pauseDuration;

            this.settings.timeStamp = new Date(newStartDay);
            ipcRenderer.send('settings:save', [this.settings, true]);
        }
        this._start_pause = 0;

        this.startNewDay();
    }

    _changeDisablingState(value) {
        this.saveButton.disabled = value;
        this.restartButton.disabled = value;
        this.minimizeButton.disabled = value;
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
    return (Math.round(number * 10) / 10);
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

function getWorkDaysInMonth (newDate) {
    let dayNumber = new Date(newDate.getFullYear(), newDate.getMonth()+1, 0).getDate();

    let currentDay = 1;
    let holydays = 0;

    let firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), currentDay);
    let weekDay = firstDay.getDay();
    let isSat = true;

    if (weekDay === 0) {
        isSat = false;
    } else if (weekDay !== 6) {
        currentDay = currentDay + (6 - weekDay);
    }

    while (currentDay <= dayNumber) {
        holydays++;

        if(isSat) {
            currentDay++;
        } else {
            currentDay+=6;
        }

        isSat = !isSat;
    }

    return dayNumber - holydays;
}