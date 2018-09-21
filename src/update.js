const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();
let date = new Date().toLocaleDateString();

const xmlFilePath = __dirname + '/../public/data/data.xml';
const clonedXML = __dirname + '/../public/data/data_' + date  + guid() + '.xml';

function updateJobsFile(jobsData) {
    cloneJobsFile();
    let updatedXml = builder.buildObject(jobsData);
    //console.log('xml: ', xml)
    fs.writeFile(xmlFilePath, updatedXml, (e, data) => {
        if (e) throw e;
        console.log('Successfully updated file.');
    })

}

function cloneJobsFile() {
    fs.readFile(xmlFilePath, 'utf-8', (err, d) => {
        if (err) throw err;

        parser.parseString(d, (er, result) => {
            if (er) throw er;
            let json = result;
            let xml = builder.buildObject(json);
            fs.writeFile(clonedXML, xml, (e, data) => {
                if (e) throw e;
                console.log('Successfully cloned file.');
            });
        });
    });
}

function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

module.exports = updateJobsFile;
/*
fs.readFile(__dirname + '/../public/data/data.xml', 'utf-8', (err, data) => {
    if (err) {
        throw err;
    } else {
        let d = new Date().toLocaleDateString();
        console.error('date: ', d)

        parser.parseString(data, (e, result) => {
            let json = result;
            json.data.job[0].title = 'New Job Title';
    
            let builder = new xml2js.Builder();
            let xml = builder.buildObject(json);
            fs.writeFile('edited-xml.xml', xml, (er, d) => {
                if (er) {
                    console.log(er);
                } else {
                    console.log('success');
                }
            })
        });
    }
});
*/