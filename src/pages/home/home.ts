import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import * as MercuryClient from "mercury-client"
import { StatisticsPage } from '../statistics/statistics';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  
  statisticsPage = StatisticsPage;
  
  url: string;
  urlContent: string; //for counting tags
  listOfUrls;
  numOfUrls: number;
  maxNumOfUrls: number;
  tagsArray;
  occurencesArray;
  params: Object;
  paramsList;

  constructor(public navCtrl: NavController, 
              public http: Http,
              private toastCtrl: ToastController) {
    
                this.listOfUrls = [];
                this.numOfUrls = 0; //number of urls passed through input element
                this.maxNumOfUrls = 5;
                this.paramsList = [];

  }

  ionViewDidLoad(){
	var s=5;
    this.findGarbageInfo();
  }

  presentErrorToast() {
    let toast = this.toastCtrl.create({
      message: 'Sorry cant get information from this site',
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  clearInput(){
    this.url = "";
  }

 sendAPIRequest(url: string){
  const mc = new MercuryClient('4dfnY7VDrj5qutZEpFfXvsIfS3wMYwWqJHXZu0P8');           
  
  console.log('url passed',url);
  mc.parse(url)
  .then((data) => { 
    //console.log('data', data); //title, date_published, domain
    this.urlContent = data.content; 
    this.countTags(this.urlContent);
    this.clearInput();
    if(this.numOfUrls < this.maxNumOfUrls){
      this.listOfUrls.push({ id: this.numOfUrls, title: data.title, date_published: data.date_published, domain: data.domain });
      this.numOfUrls++;
    }
    else{
      //delete first element from list and insert new
      this.listOfUrls.splice(0,1);
      this.listOfUrls.push({ id: this.numOfUrls, title: data.title, date_published: data.date_published, domain: data.domain });
    }
} )
  .catch((e) => {
     console.log('error', e);
      this.presentErrorToast();
    })

}
findGarbageInfo(){
  this.sendAPIRequest("http://mpgk.com.pl/dla-mieszkancow/");
   

  
}

countTags(content: string){

  console.log(this.urlContent);

  var j = 0;
  var letterNum = 0; //number of letters
  var tagFound: string; //the found tag
  var allTagArray = []; //array with all tags
  var startFound: boolean = false; //flag for start of tag
  var endFound: boolean = false; //flag for end of tag
  
  //FIND HTML TAGS
  for(var i=0; i< content.length; i++){
    
    if(content[i] == "<"){
      startFound = true;
    }
    if(startFound){
      letterNum++;
    } 
    if((content[i] == ">" && startFound) || (content[i] ==" " && startFound)){
        startFound = false;
        endFound = true;
      }
    
    if(endFound){
        //save the word in table
        tagFound ="";
        for(var z = letterNum-2; z > 0; z--){
          tagFound += content[i-z];
        }
        allTagArray[j] = tagFound;
        j++;
        letterNum = 0;
        endFound = false;
      }
    }

    //delete the "/" signs
    for(var f = allTagArray.length-1; f >=0; f--){
      if(allTagArray[f].includes("/")){
        allTagArray.splice(f,1);
      }
    }

    //CHECK FOR THE SAME ELEMENTS, CALCULATE THE NUMBER OF OCCURENCES
    //table with different tags found
    var tagArray = [];
    //table with number of occurrences for each tag found
    var occurencesArray = [];

    for(var x=0; x< allTagArray.length; x++){
      occurencesArray[x] = 0;
    }
    occurencesArray[0] = 1; //we are starting the loop from 1, so we need to add the occurence of first tag
    var isSame: boolean = false;
    tagArray[0] = allTagArray[0];

    for(var s = 1; s < allTagArray.length;s++){
      isSame = false;
      //compare each element from array with current element in tagArray
      for(var t=0; t<tagArray.length;t++){
        if(tagArray[t].length == allTagArray[s].length){
          //compare these two elements, if they are the same set isSame to true
          if(this.compareElements(tagArray[t],allTagArray[s])){
            isSame = true;
            occurencesArray[t]++;
          }
        }
      }
      //if the elements aren't the same, add to array
      if(!isSame){
        tagArray.push(allTagArray[s]);
        occurencesArray[tagArray.length-1]++; 
      }
    }

    //cut the occcurences array at first zero
    occurencesArray = occurencesArray.slice(0,tagArray.length);
    //SORT THE OCCURENCES ARRAY AND THE TAGS ARRAY ACCORDINGLY
    this.sortArray(occurencesArray, tagArray);
    this.tagsArray = tagArray;
    this.occurencesArray = occurencesArray;
    //save the results to params object, which will be passed to the Statistics page
    this.params = {tags: this.tagsArray, numOfOccurences: this.occurencesArray};
    //add to list of params
    this.paramsList.push(this.params);
}

openStatisticsPage(url){
  this.params = this.paramsList[url.id];
  this.navCtrl.push(this.statisticsPage, this.params);
}

//sorts array1 in descending order, array2 is sorted accordingly
//uses selection sort algorithm
sortArray(array1, array2){
  //sort tags, by number of occurences descending
  var max_element = 0;
  
  var j = 0;
  var k = 0;
  var p;
  var temp1 = array2; 
  for (var i = 0; i < array1.length; i++)
  {   
      k = i;
      max_element = array1[i];
      for (j=i+1; j < array1.length; j++)
          if (array1[j] > max_element)
          {   k = j;
              max_element= array1[j];
          }
      p = temp1[k];
      temp1[k] = temp1[i];
      temp1[i] = p;
      array1[k] = array1[i];
      array1[i] = max_element;
  }
  for (i = 0; i < array1.length; i++)
  {
    array2[i] = temp1[i];
  }
}

//compares two string elements
compareElements(elem1, elem2): boolean {

  for(var i=0; i< elem1.length; i++){
    if(elem1[i] != elem2[i]){
      return false;
    }
  }

  return true;
}
  
}
