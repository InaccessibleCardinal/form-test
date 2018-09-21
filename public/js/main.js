//main.js
'use strict';
(function() {
    //utils
    function $id(id) {return document.getElementById(id);}
    function create(nodeName, text, attrs) {
        let el = document.createElement(nodeName);
        if (text) {
            el.innerText = text;
        }
        if (attrs) {
            for (let key in attrs) {
                el.setAttribute(key, attrs[key]);
            }
        }
        return el;
    }
    function appendChildren(el, arr) {
        arr.forEach((a) => {
            el.appendChild(a);
        }); 
    }
//initial state
    let currentDate = new Date().toLocaleDateString();
    let existingJobs = [];
//ajax
    let req = new XMLHttpRequest();
    req.open('GET','../data/data.xml');
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            let x = this.responseXML;
            let jobs = x.getElementsByTagName('job');
            let len = jobs.length;
            for (let i = 0; i < len; ++i) {
                
                let children = jobs[i].children;
                let t = children[0].textContent;
                let d = children[1].textContent;
                let r = children[2].textContent;
                existingJobs.push(new Job(t, d, r, currentDate));
            }

            renderJobs(existingJobs);
        }
    }
    req.send();
//end ajax
//basic Job class   
    function Job(title, description, rate, date) {
        this.title = title;
        this.description = description;
        this.rate = rate;
        this.dateAdded = date;
        this.ids = {};
    }
    Job.prototype.setIds = function(titleId, descriptionId, rateId) {
        this.ids.titleId = titleId;
        this.ids.descriptionId = descriptionId;
        this.ids.rateId = rateId;
    }
    Job.prototype.buildDom = function() {
        let d = create('div');
        d.setAttribute('class', 'job');
        let h = create('h3', this.title), 
        p1 = create('p', this.description), 
        p2 = create('p', this.rate);
        appendChildren(d, [h, p1, p2]);
        return d;
    }

    function renderJobs(jobs) {
        let target = $id('target');
        let h = create('h2', 'Existing Jobs');
        target.innerHTML = '';
        target.appendChild(h);
        jobs.forEach((j) => {
            let jDOM = j.buildDom();
            target.appendChild(jDOM);
        });
    }

    function editJobs() {
        let je = new JobEditor(existingJobs);
        je.buildDom();
    }
    let editButton = $id('edit');
    editButton.addEventListener('click', editJobs);


    //job editor
    function JobEditor(jobs) {
        this.jobs = jobs;
    }
    
    JobEditor.prototype.deleteJob = function(j) {
        let ids = j.ids;
        for (let jId in ids) {
            $id(ids[jId]).disabled = true;
        }
        let jobs = this.jobs;
        let len = jobs.length;
        let index = jobs.indexOf(j);
        let newJobs = jobs.slice(0, index).concat(jobs.slice(index + 1, len));
        this.jobs = newJobs;
    }
    JobEditor.prototype.buildForm = function() {
        let jobs = this.jobs;
        let wrapper = create('div');
        let _this = this;
        jobs.forEach((j, i) => {
            let div = create(
                'div', 
                false, 
                {class: 'editable-job'}
            ),
            titleLabel = create('label', 'Title: '), 
            titleInp = create(
                'input', 
                false, 
                {id: 'job-title_' + i}
            ),
            descLabel = create('label', 'Description: '), 
            descInp = create(
                'input', 
                false, 
                {id: 'job-description_' + i}
            ),
            rateLabel = create('label', 'Rate: '), 
            rateInp = create(
                'input', 
                false, 
                {id: 'job-rate_' + i}
            );
            j.setIds(
                'job-title_' + i,
                'job-description_' + i,
                'job-rate_' + i
            );
            titleInp.type = 'text';
            descInp.type = 'text';
            rateInp.type = 'text';
            titleInp.value = j.title;
            descInp.value = j.description;
            rateInp.value = j.rate;
            titleInp.addEventListener('keyup', function(e) {
                _this.updateTitle(e, j)
            });
            descInp.addEventListener('keyup', function(e) {
                _this.updateDescription(e, j)
            });
            rateInp.addEventListener('keyup', function(e) {
                _this.updateRate(e, j)
            });
            let remBtn = create(
                'button', 
                'Delete ' + j.title, 
                {class: 'remove-job'}
            );
            remBtn.addEventListener('click', function() {
                _this.deleteJob(j);
                remBtn.disabled = true;
                remBtn.innerText = 'Removed';
            });
            
            //div.setAttribute('class', 'editable-job');
            appendChildren(div, [
                remBtn, 
                titleLabel, 
                titleInp,
                descLabel,
                descInp,
                rateLabel,
                rateInp
            ]);
            wrapper.appendChild(div);
        });
        let subBtn = create(
            'button', 
            'apply changes', 
            {class: 'submit-edited-jobs'}
        );
        subBtn.addEventListener('click', function() {
            existingJobs = _this.jobs;
            renderJobs(existingJobs);
            _this.destroy();
        });
        wrapper.appendChild(subBtn);
        return wrapper;
    }

    JobEditor.prototype.updateTitle = function(e, j) {
        //console.log('KEY: ',e.keyCode)
        let jobs = this.jobs;
        j.title = e.target.value;
        let index = jobs.indexOf(j);
        let len = jobs.length;
        let newJobs = jobs.slice(0, index).concat([j], jobs.slice(index + 1, len));
        this.jobs = newJobs;
    }
    JobEditor.prototype.updateDescription = function(e, j) {
        let jobs = this.jobs;
        j.description = e.target.value;
        let index = jobs.indexOf(j);
        let len = jobs.length;
        let newJobs = jobs.slice(0, index).concat([j], jobs.slice(index + 1, len));
        this.jobs = newJobs;
    }
    JobEditor.prototype.updateRate = function(e, j) {
        let jobs = this.jobs;
        j.rate = e.target.value;
        let index = jobs.indexOf(j);
        let len = jobs.length;
        let newJobs = jobs.slice(0, index).concat([j], jobs.slice(index + 1, len));
        this.jobs = newJobs;
    }

    JobEditor.prototype.buildDom = function() {
        let _this = this;
        let body = document.body;
        let container = create(
            'div', 
            false, 
            {
                id: 'modal', 
                class: 'modal'
            }
        );
        let close = create(
            'button', 
            'X', 
            {class: 'close-button'}
        );
        close.addEventListener('click', _this.destroy);
        container.appendChild(close);
        container.appendChild(this.buildForm());
        body.appendChild(container);
    }
    JobEditor.prototype.destroy = function() {
        let modal = $id('modal');
        document.body.removeChild(modal);
    }
//end job editor    
//add job form
    function AddJobForm() {
        this.title = {
            value : null, 
            id: 'title-field'
        };
        this.description = {
            value: null, 
            id: 'description-field'
        };
        this.rate = {
            value: null, 
            id: 'rate-field'
        };
    }

    AddJobForm.prototype.buildForm = function() {
        let div = create('div', false, false);
        let h = create('h2', 'Add a New Job');
        let titleLabel = create('label', 'Title: ');
        let titleInp = create(
            'input', 
            false, 
            {
                type: 'text', 
                id: this.title.id
            }
        );
       
        let descLabel = create('label', 'Description: ');
        let descInp = create(
            'input',
             false, 
             {
                 type: 'text', 
                 id: this.description.id
            }
        );
        
        let rateLabel = create('label', 'Rate: ');
        let rateInp = create(
            'input', 
            false, 
            {
                type: 'text', 
                id: this.rate.id
            }
        );
        let addBtnContainer = create(
            'div', 
            false, 
            {class: 'add-button'}
        );
        let addBtn = create('button', 'Add To Jobs');
        addBtnContainer.appendChild(addBtn);
        let _this = this;
        titleInp.addEventListener('keyup', function(e) {
            _this.createTitle(e);
        });
        descInp.addEventListener('keyup', function(e){
            _this.createDescription(e);
        });
        rateInp.addEventListener('keyup', function(e) {
            _this.createRate(e);
        });
        addBtn.addEventListener('click', function() {
            _this.addJob();
        });
        appendChildren(div, [
            h,
            titleLabel,
            titleInp,
            descLabel,
            descInp,
            rateLabel,
            rateInp,
            addBtnContainer
        ]);
        return div;
    }
    AddJobForm.prototype.createTitle = function(e) {
        this.title.value = e.target.value;
    }
    AddJobForm.prototype.createDescription = function(e) {
        this.description.value = e.target.value;
    }
    AddJobForm.prototype.createRate = function(e) {
        this.rate.value = e.target.value;
    }
    AddJobForm.prototype.addJob = function() {

        let t = this.title, d = this.description, r = this.rate;
        if (t.value && d.value && r.value) {
            let newJob = new Job(t.value, d.value, r.value, currentDate);
            existingJobs = existingJobs.concat([newJob]);
            renderJobs(existingJobs);
            $id(t.id).value = '';
            $id(d.id).value = '';
            $id(r.id).value = '';
        }
    }
    AddJobForm.prototype.render = function() {
        let addJobTarget = $id('add-job-form');
        let form = this.buildForm();
        addJobTarget.innerHTML = '';
        addJobTarget.appendChild(form);
    }
    let addJobForm = new AddJobForm();
    addJobForm.render();
    //save button
    function SaveButton() {
        let b = create(
            'button', 
            'Save All Changes', 
            {class: 'save-button'}
        );
        b.addEventListener('click', function() {
            postJobs(existingJobs);
        });
        document.body.appendChild(b);
    }
    SaveButton();
    //to post jobs
    function postJobs(updatedJobs) {console.log('jobs? ', updatedJobs)
        let postRequest = new XMLHttpRequest();
        postRequest.open('POST', '/jobs');
        postRequest.setRequestHeader('Content-Type', 'application/json');
        postRequest.onreadystatechange = function() {
            if (this.readyState === 4) {
                console.log('posted: ', this.responseText);
            }
        }
        let jobsPayload = {};
        jobsPayload.jobs = updatedJobs.map(function(j) {
            let jobObj = {};
            delete j.ids;
            jobObj.job = j;
            return jobObj;
        });
        postRequest.send(JSON.stringify(jobsPayload));
    }
}());