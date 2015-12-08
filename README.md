Access @ http://jeanmariano.github.io/instagroups

a. Jean Mariano
   jam2332@barnard.edu
   UI Design Fall 2015
   Instagroups

b. Open up index.html and have fun :)
   Built in jQuery and Bootstrap. Used moment.js to parse time.

c. For this assignment, I decided to do a one-content per page approach. What
   that means is that for each page there is only on functionality that the
   current content view provides. I broke down the requirements into four
   different pages, 'Home', 'My Groups', 'Search Instagram', and 'Browse
   Popular'. In 'Home', the app loads the profile and the recent media of the
   user that is logged in, which I have hardcoded to be my account for
   simplicity's sake. 'My Groups' is where the user can manage the groups they
   created (i.e., edit members, edit group name, delete group). 'Search
   Instagram' is where the user can search for users or content so that they
   can add users to groups. 'Browse Popular' is where users can look at content
   that are popular at the moment.

   The group structure is managed in a JS object (a dictionary/hashmap). Group
   naming can have spaces; the dictionary index of a group has the spaces
   replaced by underscores when storing in the data structure.

   I chose this implementation because it is straightforward. I designed the UI
   in an approach that I felt was intuitive, and that approach is to fulfill
   the 10 heuristics usability points. That means communicating to the user
   about system statuses, not being vague about functionalities, complying to 
   standards, and above all, looking nice.

   The video media for some reason does not have the play button visible so the
   user has to right click for the video controls. 


d. I included the functionality to view popular media because it was something
   I already wrote for the original assignment requirements.

   If time provided, I would have implemented the functionality of the user
   being able to log in into *their* account, so that the home page loads their
   profile and not mine. 
