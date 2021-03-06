import { Component, Input, OnChanges } from "@angular/core";
import { WriteButton } from "../write-button/write-button.component";

@Component({
   selector: 'content-enter',
   templateUrl: './content-enter/content-enter.component.html',
   styleUrls: ['./content-enter/content-enter.component.css'],
   directives: [ WriteButton ]
})

export class ContentEnter implements OnChanges {
  @Input() configOptions;
  deletedSections = [];
  selEnd;
  selRange;
  lastSel;
  setBold = false;
  setItalic = false;
  setUnderline = false;
  
  ngOnChanges() {
    
  }

  constructor() { 
    let starterObj = JSON.parse(JSON.stringify(this.sectionObj));  
    let lengthSect = this.contentObj.bodySections.length;  
    if (lengthSect > 0)
      starterObj.indexVal = this.contentObj.bodySections[lengthSect - 1].indexVal + 1;
    this.contentObj.bodySections.push(starterObj);
  }  

  bold() {
    this.setBold = true;
    console.log("bold it");
  }

  italic() {
    this.setItalic = true;
    console.log("italicize it");
  }

  underline() {
    this.setUnderline = true;
    console.log("underline it");
  }

  fontChange(fontName) {
    console.log("change font: " + fontName);
  }

  fontSizeChange(fontSize) {
    console.log("change size: " + fontSize);
  }

  indent() {
    console.log("move in");
  }

  reverseIndent() {
    console.log("move out");
  }

  insertReference(data) {
    console.log("add reference");
  }

  updateHeaderInfo(selection, content) {
    // console.log(change.currentTarget.outerText);
    // = JSON.parse(JSON.stringify(this.headerObj));
    let lookFor = '';
    let side = '';
    let lowSide = '';
    switch(selection) {
      case 'firstLeft':
        lookFor = 'firstPage';
        side = 'Left';
        lowSide = 'left';
        break;
      case 'firstRight':
        lookFor = 'firstPage';
        side = 'Right';
        lowSide = 'right'
        break;
      case 'left':
        lookFor = 'default';
        side = 'Left';
        lowSide = 'left';
        break;
      case 'right':
        lookFor = 'default';
        side = 'Right';
        lowSide = 'right';
        break;      
    }
    let newHeader;
    for (let index in this.contentObj.headers) {
      let header = this.contentObj.headers[index];
      if (header.applyTo == lookFor) {
        newHeader = header;
        delete this.contentObj.headers[index];
      }
    }
    if (!newHeader) {
      newHeader = JSON.parse(JSON.stringify(this.headerObj));
      newHeader.applyTo = lookFor;
    }
    newHeader[lowSide + 'Type'] = 'text';
    
    newHeader['formatSections' + side] = [];
    let newFormatSection = JSON.parse(JSON.stringify(this.formatSectionObj));
    newFormatSection.content = content;
    newHeader['formatSections' + side].push(newFormatSection);
    this.contentObj.headers.push(newHeader);
  }

  getHeaderInfo(applyTo, side) {
    let toGetContent;
    for (let header of this.contentObj.headers) {
      // let header = this.contentObj.headers[index];
      if (header && header.applyTo == applyTo) {
        toGetContent = header['formatSections' + side];
      }
    }
    return toGetContent && toGetContent.length > 0 ? this.contentify([{ formatSections: toGetContent }], true) : '';
  }

  setLabel(section, content) {
    let newFormat = JSON.parse(JSON.stringify(this.formatSectionObj));
    newFormat.content = content;
    switch(section) {
      case 'summary': 
        this.contentObj.summaryLabel.formatSections = [ newFormat ];
        break;
      case 'conclusion':
        this.contentObj.conclusionLabel.formatSections = [ newFormat ];
        break;      
    }
  }

  getLabel(section) {
    let toReturn = "";
    switch(section) {
      case 'summary':
        toReturn = this.contentObj.summaryLabel.formatSections && this.contentObj.summaryLabel.formatSections.length > 0 ? this.contentify([{ formatSections: this.contentObj.summaryLabel.formatSections }], true) : '';
        break;
      case 'conclusion':
        toReturn = this.contentObj.conclusionLabel.formatSections && this.contentObj.conclusionLabel.formatSections.length > 0 ? this.contentify([{ formatSections: this.contentObj.conclusionLabel.formatSections }], true) : '';
        break;
    }
    return toReturn;
  }

  setSectionLabel(section, labelContent) {
    let setSectionObj;
    if (this.contentObj.bodySections) {
      for (let i = 0; i < this.contentObj.bodySections.length; i++) {
        let retrievedSection = this.contentObj.bodySections[i];
        if (retrievedSection.indexVal == section.indexVal) {
          setSectionObj = JSON.parse(JSON.stringify(retrievedSection));
          this.deleteSection(section, false);
        }
      }
    }
    if (!setSectionObj) {
      setSectionObj = JSON.parse(JSON.stringify(this.sectionObj));
    }
    let newFormatSection = JSON.parse(JSON.stringify(this.formatSectionObj));
    newFormatSection.content = labelContent;//this.contentify([labelContent], true);    
    setSectionObj.label.formatSections = [newFormatSection];
    this.contentObj.bodySections.push(setSectionObj);
  }

  getSectionLabel(section) {
    if (this.contentObj.bodySections) {
      for (let i = 0; i < this.contentObj.bodySections.length; i++) {
        let retrievedSection = this.contentObj.bodySections[i];
        if (retrievedSection.indexVal == section.indexVal) {
          return this.contentify([{ formatSections: retrievedSection.label.formatSections }]);
        }
      }
    }
    return '';
  }

  updateTitleInfo(name, content) {
    let titleInfoToAdd = JSON.parse(JSON.stringify(this.titleFieldObj));
    titleInfoToAdd.name = name;
    let formatSectionToAdd = JSON.parse(JSON.stringify(this.formatSectionObj));
    formatSectionToAdd.content = content;
    titleInfoToAdd.formatSections.push(formatSectionToAdd);
    let indexToAdd = 0;
    for (let index in this.contentObj.titleFields) {
      let titleObj = this.contentObj.titleFields[index];
      if (titleObj.name == name) {
        indexToAdd = titleObj.index;
        delete this.contentObj.titleFields[index];
      }
    }
    titleInfoToAdd.index = indexToAdd;
    this.contentObj.titleFields.push(titleInfoToAdd);
  }

  getTitleField(name) {
    for (let index in this.contentObj.titleFields) { 
      let titleObj = this.contentObj.titleFields[index];
      if (titleObj.name == name) {
        return this.contentify([titleObj]);
      }
    }    
  }

  deleteSection(section, confirmDelete = true) {
    let todelete = confirmDelete ? confirm("Are you sure you want to delete this section?  If you proceed, the contents will be lost and it cannot be undone.") : true;
    if (todelete) {
      for (let i = 0; i < this.contentObj.bodySections.length; i++) {
        if (this.contentObj.bodySections[i].indexVal === section.indexVal) {
          this.deletedSections.push(this.contentObj.bodySections[i]);
          this.contentObj.bodySections.splice(i, 1);
        }
      }
    }
  }

  addSection(msg) {
    let newSection = JSON.parse(JSON.stringify(this.sectionObj));
    let lengthSect = this.contentObj.bodySections.length;  
    if (lengthSect > 0)
      newSection.indexVal = this.contentObj.bodySections[lengthSect - 1].indexVal + 1;
    newSection.sectionLevel = 1;
    this.contentObj.bodySections.push(newSection);
  }

  addSubsection(msg) {
    let newSection = JSON.parse(JSON.stringify(this.sectionObj));
    let lengthSect = this.contentObj.bodySections.length;  
    if (lengthSect > 0)
      newSection.indexVal = this.contentObj.bodySections[lengthSect - 1].indexVal + 1;
    newSection.sectionLevel = 2;
    this.contentObj.bodySections.push(newSection);
  }

  addSubsubsection(msg) {
    let newSection = JSON.parse(JSON.stringify(this.sectionObj));
    let lengthSect = this.contentObj.bodySections.length;  
    if (lengthSect > 0)
      newSection.indexVal = this.contentObj.bodySections[lengthSect - 1].indexVal + 1;
    newSection.sectionLevel = 3;
    this.contentObj.bodySections.push(newSection);
  }
  
  getOffset(property: string, value1: string, result1: string, value2: string, result2: string, value3: string, result3: string) {
    if (property === value1)
      return result1;
    if (property === value2)
      return result2;
    if (property === value3)
      return result3;
  }

  parseSectionContent(section, sectionContent) {
    for (let i = 0; i < this.contentObj.bodySections.length; i++) {
      let checkSection = this.contentObj.bodySections[i];
      if (checkSection.indexVal == section.indexVal) {
        let modifySection = JSON.parse(JSON.stringify(checkSection));
        this.deleteSection(section, false);
        modifySection.paragraphs = this.parseParagraphs(sectionContent);
        this.contentObj.bodySections.push(modifySection);
      }
    }
  }

  setSelection(divContent, last) {
    // console.log(divContent);
    this.lastSel = last;
    var sel;
    var preCaretRange;
    var selLength = 0;
    var caretOffset = 0;
    if (typeof window.getSelection != "undefined"){
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        var range = window.getSelection().getRangeAt(0);
        preCaretRange = range.cloneRange();
        selLength = preCaretRange.toString().length;
        // preCaretRange.selectNodeContents(divContent);
        preCaretRange.setStart(range.startContainer, 0);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    }
    // else if ((sel == doc.selection) && sel.type != "Control") {
    //   var textRange = sel.createRange();
    //   var preCaretTextRange = doc.body.createTextRange();
    //   preCaretTextRange.moveToElementText(element);
    //   preCaretTextRange.setEndPoint("EndToEnd", textRange);
    //   caretOffset = preCaretTextRange.text.length;
    // }
    // console.log(`${caretOffset},${selLength}`);
    this.selEnd = caretOffset;
    this.selRange = selLength;
  }

  getSectionContent(section) {
    for (let i = 0; i < this.contentObj.bodySections.length; i++) {
      let checkSection = this.contentObj.bodySections[i];
      if (checkSection.indexVal == section.indexVal) {
        return this.contentify(checkSection.paragraphs, '');
      }
    }
  }

  parseSummary(summaryContent) {
    let paragraphs = this.parseParagraphs(summaryContent);
    this.contentObj.summaryParagraphs = paragraphs;
    // console.log(this.contentObj);
  }

  getSummary() {
    if ((this.setBold || this.setItalic || this.setUnderline) && this.lastSel == 'summary') {
      this.setFormat('summaryParagraphs');
    }
    return this.contentify(this.contentObj.summaryParagraphs, 'summary');
  }

  parseConclusion(conclusionContent) {
    let paragraphs = this.parseParagraphs(conclusionContent);
    this.contentObj.conclusionParagraphs = paragraphs;
    console.log(this.contentObj);
  }

  getConclusion() {
    if ((this.setBold || this.setItalic || this.setUnderline) && this.lastSel == 'conclusion') {
      this.setFormat('conclusionParagraphs');
    }
    return this.contentify(this.contentObj.conclusionParagraphs, 'conclusion');
  }

  setFormat(sectionName) {
    let formatCount = 0;
    let formatSectionsToAdd = [];
    let rangeEnd = false;
    for (let i = 0; i < this.contentObj[sectionName].formatSections.length; i++) {
      let formatCountStart = formatCount;
      formatCount += this.contentObj[sectionName].formatSections[i].content.length;
      if (formatCount < this.selEnd - this.selRange) {       
        if (!rangeEnd) {
          let startPoint;
          let endPoint;
          let sectionLength = this.contentObj[sectionName].formatSections[i].content.length;
          if (this.selEnd <= formatCount) {
            rangeEnd = true;
          }

          if (this.selEnd >= formatCount) {
            endPoint = sectionLength;
          }          
          else {
            endPoint = this.selEnd - formatCountStart;
          }
          if (formatCountStart <= this.selEnd - this.selRange) {
            startPoint = 0;
          }
          else {
            startPoint = this.selEnd - this.selRange - formatCountStart;
          }

          let newFormatSection = JSON.parse(JSON.stringify(this.contentObj[sectionName].formatSections[i]));
          if (startPoint == 0 && endPoint == sectionLength) {
            newFormatSection = this.getNewFormat(newFormatSection);
            formatSectionsToAdd.push(newFormatSection);
          }
          else if (endPoint == sectionLength) {
            let unformatted = JSON.parse(JSON.stringify(newFormatSection));            
            unformatted.content = newFormatSection.content.substring(startPoint, endPoint);
            newFormatSection.content = newFormatSection.content.substring(endPoint, newFormatSection.content.length);
            newFormatSection = this.getNewFormat(newFormatSection);
            formatSectionsToAdd.push(unformatted);
            formatSectionsToAdd.push(newFormatSection);
          }
          else if (startPoint == 0) {
            let unformatted = JSON.parse(JSON.stringify(newFormatSection));            
            unformatted.content = newFormatSection.content.substring(endPoint, newFormatSection.content.length);
            newFormatSection.content = newFormatSection.content.substring(0, endPoint);
            newFormatSection = this.getNewFormat(newFormatSection);
            formatSectionsToAdd.push(newFormatSection);
            formatSectionsToAdd.push(unformatted);
          }
          else  {
            let unformattedBegin = JSON.parse(JSON.stringify(newFormatSection)); 
            let unformattedEnd = JSON.parse(JSON.stringify(newFormatSection));            
            unformattedBegin.content = newFormatSection.content.substring(endPoint, newFormatSection.content.length);
            unformattedEnd.content = newFormatSection.content.substring(0, startPoint);
            newFormatSection.content = newFormatSection.content.substring(startPoint, endPoint);
            newFormatSection = this.getNewFormat(newFormatSection);
            formatSectionsToAdd.push(unformattedBegin);
            formatSectionsToAdd.push(newFormatSection);
            formatSectionsToAdd.push(unformattedEnd);
          }
        }
        else {
          let newFormatSection = JSON.parse(JSON.stringify(this.contentObj[sectionName].formatSections[i]));
          formatSectionsToAdd.push(newFormatSection);
        }        
      }
      else {
        formatSectionsToAdd.push(this.contentObj[sectionName].formatSections[i]);
      }
    }
    this.contentObj[sectionName].formatSections = formatSectionsToAdd;
  }

  getNewFormat(formatSection) {
    if (this.setBold) {
      formatSection.bold = true;
    }
    if (this.setUnderline) {
      formatSection.underline = true;
    }
    if (this.setItalic) {
      formatSection.italic = true;
    }
    this.setBold = false;
    this.setUnderline = false;
    this.setItalic = false;
    return formatSection;
  }

  contentify(toParse, noDiv?) {
    // if (section == this.lastSel && (this.setBold || this.setItalic || this.setUnderline)) {
    //   let toAffect = '';
    //   switch(section) {
    //     case 'summary':
    //       toAffect = 'summaryParagraphs';
    //       break;
    //     case 'conclusion':
    //       toAffect = 'conclusionParagraphs';
    //       break;
    //   }
    //   //Go through all paragraphs and format sections in contentobj
    //   let toChange = JSON.parse(JSON.stringify(this.contentObj[toAffect]));
    //   this.contentObj[toAffect] = [];
    //   let countKeeper = 0;
    //   for (let i = 0; i < toChange.length; i++) {
    //     for (let j = 0; j < toChange[i].formatSections.length; j++) {
    //       let sectionChange = toChange[i].formatSections[j];
    //       countKeeper += sectionChange.content.length;

    //     }
        
    //   }


    // }
    let content = "";
    for (let i = 0; i < toParse.length; i++) {
      let paragraphContent = noDiv ? "" : "<div>";
      let paragraph = toParse[i];
      for (let j = 0; j < paragraph.formatSections.length; j++) {
        let formatContent = '<span class="formatSection">';
        let formatSection = paragraph.formatSections[j];
        if (formatSection.bold)
          formatContent += "<strong>";
        if (formatSection.underline)
          formatContent += "<u>";
        if (formatSection.italicize)
          formatContent += "<em>";
        formatContent += `<span style="font-family: '${formatSection.font}'; font-size: '${formatSection.fontSize}'">${formatSection.content}</span>`;
        if (formatSection.italicize)
          formatContent += "</em>";
        if (formatSection.underline)
          formatContent += "</u>";
        if (formatSection.bold)
          formatContent += "</strong>";
        formatContent += "</span>"
        paragraphContent += formatContent;
      }
      if (paragraphContent == "<div>")
        paragraphContent += "<br>";
      paragraphContent += noDiv ? "" : "</div>";
      content += paragraphContent;
    }
      
    



        // this.contentObj
        // for (let i = 0; i < paragraphs.length; i++) {

        // }



        // let sections = content.split('<span class="formatSection">');
        // let startingPoint = 0;
        // let continueChecking = true;
        // for (let i = 0; i < sections.length; i++) {
        //   let filtered = sections[i]
        //     .replace('<strong>', '')
        //     .replace('</strong>', '')
        //     .replace('<u>', '')
        //     .replace('</u>', '')
        //     .replace('<em>', '')
        //     .replace('</em>', '')
        //     .replace('<br>', '')
        //     .replace('<div>', '')
        //     .replace('</div>', '')
        //     .replace(/<span .*>/g, '')
        //     //TODO: check regex
        //     .replace('</span>', '');
        //   startingPoint += filtered.length;
        //   if (startingPoint > this.selEnd - this.selRange) {
        //     this.setSectionFormat(section, )
        //   }
        // }
      // }
    // }
    // let filtered = content
    //   .replace('<strong>', '')
    //   .replace('</strong>', '')
    //   .replace('<u>', '')
    //   .replace('</u>', '')
    //   .replace('<em>', '')
    //   .replace('</em>', '')
    //   .replace('<br>', '')
    //   .replace('<div>', '')
    //   .replace('</div>', '')
    //   .replace(/<span .*>/g, '')
    //   //TODO: check regex
    //   .replace('</span>', '');
    // if (this.setBold) {
    //   this.setBold = false;

    // }



    return content;
  }

  // setSectionFormat(section, sectionIndex, changed, value) {
  //   let toChange = '';
  //   switch (section) {
  //     case 'summary':
  //       // toChange = 'summaryParagraphs';
  //       this.contentObj.summaryParagraphs[].formatSections[sectionIndex][changed] = value;
  //       break;
  //     case 'conclusion':
  //       toChange = 'conclusionParagraphs';
  //       break;
  //     case 'body':

  //       break;
  //   }
  //   this.contentObj[toChange].formatSections[sectionIndex][changed] = value;
  // }

  parseParagraphs(paragraphs) {
    let toReturn = [];
    let paragraphsSplit = paragraphs.split("<div>");    
    for(let i = 0; i < paragraphsSplit.length; i++) {
      let paragraph = paragraphsSplit[i].replace("</div>", "");
      let newParagraphObj = JSON.parse(JSON.stringify(this.paragraphObj));
      let newFormatObj = JSON.parse(JSON.stringify(this.formatSectionObj));
      newFormatObj.content = paragraph;
      newParagraphObj.formatSections.push(newFormatObj);
      toReturn.push(newParagraphObj);      
    }
    return toReturn;
  }

  titleFieldObj = {
    name: "",
    formatSections: [],
    index: 0
  };
  formatSectionObj = {
    bold: false,
    underline: false,
    italicize: false,
    fontSize: 12,
    font: "Times New Roman",
    content: "",  
    indexVal: 0  
  };
  paragraphObj = {
    alignment: "left",
    spacing: 2,
    topIndent: 1,
    bottomIndent: 0,
    formatSections: []
  };
  sectionObj = {
    sectionLevel: 1,
    onOwnPage: false,
    includeLabel: true,
    label: {			
      formatSections: [],
      font: "Times New Roman",
      fontSize: 12,
      bold: true,
      underline: false,
      italicize: false
    },
    paragraphs: [],
    indexVal: 0
  };
  referenceFieldObj = {
    name: "",
    value: "",
    bold: false,
    underline: false,
    italicize: false,
    inQuotes: false,
    inParens: false
  };
  quotationObj = {
    content: "",
    block: false
  };
  referenceObj = {
    keyData: "Title",
    fields: [],
    inText: "",
    quotations: []
  };
  headerObj = {
    applyTo: "firstPage",
    leftType: "text",
    rightType: "pageNumber",
    formatSectionsLeft: [],
    formatSectionsRight: []
  };
  contentObj = {
    titleFields: [],
    headers: [],
    summaryLabel: {
      formatSections: [],
      font: "Times New Roman",
      fontSize: 12,
      bold: true,
      underline: false,
      italicize: false
    },
    summaryParagraphs: [],
    bodySections: [],
    conclusionLabel: {
      formatSections: [],
      font: "Times New Roman",
      fontSize: 12,
      bold: true,
      underline: false,
      italicize: false
    },
    conclusionParagraphs: [],
    references: []
  };


}