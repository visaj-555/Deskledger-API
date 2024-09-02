### List Data Processing 

- Step 1: On `/create` (post API method) list API call `First Micro Service` will be called to `divide` the Uploaded Single or Multiple File into `CSV Chunks`.
- Step 2: `Chunks Dividing Service`, It will Divide the uploaded CSV file into Chunks using `split` command. 
- Step 3: Inside the First service, We are also creating a `Process State Container` to Access the Data inside second service & use to update the upload status.
- Step 4: After Dividing of CSV Files is completed a for_of loop will `send the Chunks file one by one to another Micro Service  (Synchronously)`.
- Step 5: In the `Second Micro Service (For Each Chunk File)`,
  - Step 1: Parse the Chunk File into a JSON and temporary keep in one variable.
  - Step 2: Extract only `Valid Phone Numbers` from Parsed CSV File into an Array.
  - Step 3: Executing a `distinct` mongodb query to Get a list of Duplicate Found Numbers & later convert it into object keys.
  - Step 4: Executing a `distinct` mongodb query to Get a list of DNC Found Numbers & later convert it into object keys.
  - Step 5: Using For_of loop to process chunks row by row, here inside `Mapping of Fields, Checking the duplication & DNC numbers for the current chunks file` and preparing the processed chunks into an Array of Object File.
  - Step 6: Now Processed Array of Object Will is stored as a `JSON file.`
  - Step 7: Importing the JSON File into Database.
  - Step 8: Updating the Values as Per the State container for updating the upload process status.
  - Step 9: `Repeat Step 1 to 8` until all the chunks files are processed. If all the chunks files are processed then delete all the temporary chunks and json file.