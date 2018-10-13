<!--@h1([pkg.name])-->
# fms-api-client
<!--/@-->

[![Build Status](https://travis-ci.org/Luidog/fms-api-client.png?branch=master)](https://travis-ci.org/Luidog/fms-api-client) [![Known Vulnerabilities](https://snyk.io/test/github/Luidog/fms-api-client/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Luidog/fms-api-client?targetFile=package.json) [![Coverage Status](https://coveralls.io/repos/github/Luidog/fms-api-client/badge.svg?branch=master)](https://coveralls.io/github/Luidog/fms-api-client?branch=master) [![GitHub issues](https://img.shields.io/github/issues/Luidog/fms-api-client.svg?style=plastic)](https://github.com/Luidog/fms-api-client/issues) [![Github commits (since latest release)](https://img.shields.io/github/commits-since/luidog/fms-api-client/latest.svg)](https://img.shields.io/github/issues/Luidog/fms-api-client.svg) [![GitHub license](https://img.shields.io/github/license/Luidog/fms-api-client.svg)](https://github.com/Luidog/fms-api-client/blob/master/LICENSE.md)

A FileMaker Data API client designed to allow easier interaction with a FileMaker application from a web environment. This client abstracts the FileMaker 17 Data API into class based methods. You can find detailed documentation on this project here:

[fms-api-client documentation](https://luidog.github.io/fms-api-client/)

<!--@installation()-->
## Installation

```sh
npm install --save fms-api-client
```
<!--/@-->

## Usage

### Introduction

The fms-api-client is a wrapper around the [FileMaker Data API](https://fm.mutesymphony.com/fmi/data/apidoc/). Much :heart: to FileMaker for their work on the Data API. The client attempts to follow the terminology used by FileMaker wherever possible. the client uses a lightweight datastore to hold Data API connections. The client contains methods which are modeled after the Data API Endpoints.

The client requires that you first connect to a datastore before creating or querying the FileMaker class. You can use the datastore to save a multitude of clients. Each client committed to the datastore will automatically handle Data API Sessions. Once saved to the data store a client's methods can be used to interact with a FileMaker Database without the need for additional authentication.

Each client will manage their own FileMaker Data API session, but the clients can manually open or close their FileMaker sessions by calling either the `client.login()` method or the `client.logout()` method. To remove a client from a datastore and log out a session call `client.destroy()`.

The client supports the same parameter syntax as is found in the [Data API Documentation](https://fm.mutesymphony.com/fmi/data/apidoc/). Where appropriate and useful the client also allows additional parameters. Any method that accepts script or portals in a query or body parameters will also accept the following script and portal parameters:

#### Script Array Syntax

The custom script parameter follows the following syntax:

<!--@snippet('./examples/schema/scripts-array-schema.json', { showSource: true })-->
```json
{
  "scripts": [
    {
      "name": "At Mos Eisley",
      "phase": "presort",
      "param": "awesome bar"
    },
    {
      "name": "First Shot",
      "phase": "prerequest",
      "param": "Han"
    },
    {
      "name": "Moof Milker",
      "param": "Greedo"
    }
  ]
}
```

> File [./examples/schema/scripts-array-schema.json](./examples/schema/scripts-array-schema.json)
<!--/@-->

#### Portal Array Syntax

The custom portal parameter follows the following syntax:

<!--@snippet('./examples/schema/portals-array-schema.json', { showSource: true })-->
```json
{
  "portals": [
    { "name": "planets", "limit": 1, "offset": 1 },
    { "name": "vehicles", "limit": 2 }
  ]
}
```

> File [./examples/schema/portals-array-schema.json](./examples/schema/portals-array-schema.json)
<!--/@-->

**Note:** The FileMaker script and portal syntax will override the alternative script and portal parameter syntax.

In addition to allowing an exanded syntax for invoking script or selecting portals the client will also automatically parse arrays, objects, and numbers to adhere to the requirements of the Data API. Arrays and objects are stringified before being inserted into field data. Also limits and offsets can be set as either a strings or a numbers.

The client will also automatically convert `limit`, `find`, and `offset` into their underscored conterparts as needed. Additionally, if a script result can be parsed as JSON it will be automatically parsed for you by the client.

All methods on the client return promises and each each method will reject with a message and code upon encountering an error. All messages and codes follow the FileMaker Data API where possible.

This project also provides utility modules to aid in working with FileMaker Data API Results. The provided utility modules are `fieldData`, `recordId`, and `transform`. These utilities will accept and return either an object or an an array objects. For more information on the utility modules see the utility section.

### Datastore Connection

Connect must be called before the FileMaker class is used. This connect uses Marpat. Marpat is a fork of Camo. Thanks and love to [Scott Robinson](https://github.com/scottwrobinson) for his creation and maintenance of Camo. My fork of Camo - Marpat is designed to allow the use of multiple datastores with the focus on encrypted file storage and project flexibility.

For more information on marpat and the different types of supported storage visit [marpat](https://github.com/Luidog/marpat)

<!--@snippet('./examples/index.js#datastore-connect-example', { showSource: true })-->
```js
const { connect } = require('marpat');
connect('nedb://memory')
```

> Excerpt from [./examples/index.js](./examples/index.js#L24-L25)
<!--/@-->

### Client Creation

After connecting to a datastore you can import and create clients. A client is created using the create method on the Filemaker class. The FileMaker class accepts an object with the following properties:

| Property    |   Type  |                                            Description                                           |
| ----------- | :-----: | :----------------------------------------------------------------------------------------------: |
| application |  String |                  **required** The FileMaker application / database to connect to                 |
| server      |  String | **required** The FileMaker server to use as the host. **Note:** Must be an http or https Domain. |
| user        |  String |     **required** The FileMaker user account to be used when authenticating into the Data API     |
| password    |  String |                        **required** The FileMaker user account's password.                       |
| name        |  String |                                **optional** A name for the client.                               |
| usage       | Boolean |          **optional** Track Data API usage for this client. **Note:** Default is `true`          |

<!--@snippet('./examples/index.js#client-create-example', { showSource: true })-->
```js
    const client = Filemaker.create({
      application: process.env.APPLICATION,
      server: process.env.SERVER,
      user: process.env.USERNAME,
      name: process.env.CLIENT_NAME,
      usage: process.env.CLIENT_USAGE_TRACKING,
      password: process.env.PASSWORD
    });
```

> Excerpt from [./examples/index.js](./examples/index.js#L29-L36)
<!--/@-->

**Note:** The server must be an http or https domain.

A client can be used directly after saving it. The `client.save()` method takes no arguments and will either reject with an error or resolve with a useable client. The client will automatically handle Data API session creation and expiration. Once a client is saved it will be stored on the datastore for reuse later.

<!--@snippet('./examples/index.js#client-save-example', { showSource: true })-->
```js
    return client.save();
  })
  .then(client => authentication(client))
  .then(client => creates(client))
  .then(client => gets(client))
  .then(client => lists(client))
  .then(client => finds(client))
  .then(client => edits(client))
  .then(client => scripts(client))
  .then(client => globals(client))
  .then(client => deletes(client))
  .then(client => uploads(client))
  .then(client => utilities(client))
```

> Excerpt from [./examples/index.js](./examples/index.js#L39-L51)
<!--/@-->

A client can be removed using either the `client.destroy()` method, the `Filemaker.deleteOne(query)` method or the `Filemaker.deleteMany(query)` method.

**Note** Only the `client.destroy()` method will close a FileMaker session. Any client removed using the the `Filemaker.deleteOne(query)` method or the `Filemaker.deleteMany(query)` method will not log out before being destroyed.

### Client Use

A client can be used after it is created and saved or recalled from the datastore. The `Filemaker.find(query)` or `Filemaker.findOne(query)` methods can be used to recall clients. The `filemaker.findOne(query)` method will return either an client or null. The `filemaker.find(query)` will return an array of clients. All public methods on the client are return promises.

<!--@snippet('./examples/create.examples.js#create-many-records', { showSource: true })-->
```js
const createManyRecords = client =>
  Promise.all([
    client.create('Heroes', { name: 'Anakin Skywalker' }, { merge: true }),
    client.create('Heroes', { name: 'Obi-Wan' }, { merge: true }),
    client.create('Heroes', { name: 'Yoda' }, { merge: true })
  ]).then(result => log('create-many-records-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L28-L33)
<!--/@-->

Results:

<!--@snippet('./examples/results/create-many-records-example.json', { showSource: true })-->
```json
[
  {
    "name": "Anakin Skywalker",
    "recordId": "740319",
    "modId": "0"
  },
  {
    "name": "Obi-Wan",
    "recordId": "740314",
    "modId": "0"
  },
  {
    "name": "Yoda",
    "recordId": "740316",
    "modId": "0"
  }
]
```

> File [./examples/results/create-many-records-example.json](./examples/results/create-many-records-example.json)
<!--/@-->

### Data API Sessions

The client will automatically handle creating and closing Data API sessions. If required the client will authenticate and generate a new session token with each method call. The Data API session is also monitored, updated, and saved as the client interacts with the Data API. A client will always attempt to reuse a valid token whenever possible.

The client contains two methods related to Data API sessions.These methods are `client.login()` and `client.logout()`. The login method is used to start a Data API session and the logout method will end a Data API session.

#### Login Method

The client will automatically call the login method if it does not have a valid token. This method returns an object with a token property. This method will also save the token to the client's connection for future use.

`client.login()`

<!--@snippet('./examples/authentication.examples.js#client-login-example', { showSource: true })-->
```js
const login = client => client.login();
```

> Excerpt from [./examples/authentication.examples.js](./examples/authentication.examples.js#L11-L11)
<!--/@-->

#### Logout Method

The logout method is used to end a Data API session. This method will also remove the current client's authentication token.

`client.logout()`

**Note** The logout method will change in an upcoming release. It will be modified to accept a session parameter.

<!--@snippet('./examples/authentication.examples.js#client-logout-example', { showSource: true })-->
```js
const logout = client =>
  client.logout().then(result => log('client-logout-example', result));
```

> Excerpt from [./examples/authentication.examples.js](./examples/authentication.examples.js#L6-L7)
<!--/@-->

### Create Records

Using the client you can create filemaker records. To create a record specify the layout to use and the data to insert on creation. The client will automatically convert numbers, arrays, and objects into strings so they can be inserted into a filemaker field.

`client.create(layout, data, parameters)`

| Input      |   Type | Description                                          |
| ---------- | -----: | ---------------------------------------------------- |
| layout     | String | The layout to use as context for creating the record |
| data       | Object | The data to use when creating a record.              |
| parameters | Object | The parameters to use when creating a record.        |

<!--@snippet('./examples/create.examples.js#create-record-example', { showSource: true })-->
```js
const createRecord = client =>
  client
    .create('Heroes', {
      name: 'George Lucas'
    })
    .then(result => log('create-record-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L6-L11)
<!--/@-->

Result:

<!--@snippet('./examples/results/create-record-example.json', { showSource: true })-->
```json
{
  "recordId": "740315",
  "modId": "0"
}
```

> File [./examples/results/create-record-example.json](./examples/results/create-record-example.json)
<!--/@-->

Both the create method and the edit method accept a merge boolean in their options. If merge is true the data used to create or edit the filemaker record will be merged with

<!--@snippet('./examples/create.examples.js#create-record-merge', { showSource: true })-->
```js
const mergeDataOnCreate = client =>
  client
    .create(
      'Heroes',
      {
        name: 'George Lucas'
      },
      { merge: true }
    )
    .then(result => log('create-record-merge-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L15-L24)
<!--/@-->

Result:

<!--@snippet('./examples/results/create-record-merge-example.json', { showSource: true })-->
```json
{
  "name": "George Lucas",
  "recordId": "740318",
  "modId": "0"
}
```

> File [./examples/results/create-record-merge-example.json](./examples/results/create-record-merge-example.json)
<!--/@-->

The create methods also allows you to trigger scripts when creating a record. Notice the scripts property in the following example. You can specify scripts to run using either FileMaker's script.key syntax or specify an array of scripts with a name, phase, and script parameter.

<!--@snippet('./examples/create.examples.js#trigger-scripts-on-create', { showSource: true })-->
```js
const triggerScriptsOnCreate = client =>
  client
    .create(
      'Heroes',
      { name: 'Anakin Skywalker' },
      {
        merge: true,
        scripts: [
          { name: 'Create Droids', param: { droids: ['C3-PO', 'R2-D2'] } }
        ]
      }
    )
    .then(result => log('trigger-scripts-on-create-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L37-L49)
<!--/@-->

Result:

<!--@snippet('./examples/results/trigger-scripts-on-create-example.json', { showSource: true })-->
```json
{
  "name": "Anakin Skywalker",
  "scriptError": "0",
  "recordId": "740317",
  "modId": "0"
}
```

> File [./examples/results/trigger-scripts-on-create-example.json](./examples/results/trigger-scripts-on-create-example.json)
<!--/@-->

### Get Record Details

`client.get(layout, recordId, parameters)`

<!--@snippet('./examples/get.examples.js#get-record-example', { showSource: true })-->
```js
      client
        .get('Heroes', response.data[0].recordId)
        .then(result => log('get-record-example', result))
```

> Excerpt from [./examples/get.examples.js](./examples/get.examples.js#L9-L11)
<!--/@-->

Result:

<!--@snippet('./examples/results/get-record-example.json', { showSource: true })-->
```json
{
  "data": [
    {
      "fieldData": {
        "name": "Yoda",
        "image(1)": "",
        "object": "",
        "array": "",
        "height": "",
        "id": "78786E05-C0E8-1C43-9E19-1FA66B250257",
        "imageName": "",
        "faceDescriptor": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "733105",
      "modId": "1"
    }
  ]
}
```

> File [./examples/results/get-record-example.json](./examples/results/get-record-example.json)
<!--/@-->

### List Records

You can use the client to list filemaker records. The list method accepts a layout and parameter variable. The client will automatically santize the limit, offset, and sort keys to correspond with the DAPI's requirements.

`client.list(layout, parameters)`

<!--@snippet('./examples/list.examples.js#list-records-example', { showSource: true })-->
```js
const listHeroes = client =>
  client
    .list('Heroes', { limit: 2 })
    .then(result => log('list-records-example', result));
```

> Excerpt from [./examples/list.examples.js](./examples/list.examples.js#L6-L9)
<!--/@-->

Result:

<!--@snippet('./examples/results/list-records-example.json', { showSource: true })-->
```json
{
  "data": [
    {
      "fieldData": {
        "name": "George Lucas",
        "image(1)": "https://some-server.com/Streaming_SSL/MainDB/1218E61A34D3E75485AB20BE46B7ACF27D668994AA08EC2D9A0B4B0CD9E67F11?RCType=EmbeddedRCFileProcessor",
        "object": "",
        "array": "",
        "height": "",
        "id": "0E6DF26C-761E-7947-9A3C-C312C285EE55",
        "imageName": "placeholder.md",
        "faceDescriptor": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "732765",
      "modId": "7"
    },
    {
      "fieldData": {
        "name": "George Lucas",
        "image(1)": "",
        "object": "",
        "array": "",
        "height": "",
        "id": "0F628510-432C-0E47-8D03-BA90AAF2EA17",
        "imageName": "",
        "faceDescriptor": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "732766",
      "modId": "1"
    }
  ]
}
```

> File [./examples/results/list-records-example.json](./examples/results/list-records-example.json)
<!--/@-->

### Find Records

The client's find method will accept either a single object as find parameters or an array. The find method will also santize the limit, sort, and offset parameters to conform with the Data API's requirements.

`client.find(layout, query, parameters)`

<!--@snippet('./examples/find.examples.js#find-records-example', { showSource: true })-->
```js
const findRecords = client =>
  client
    .find('Heroes', [{ name: 'Anakin Skywalker' }], { limit: 1 })
    .then(result => log('find-records-example', result));
```

> Excerpt from [./examples/find.examples.js](./examples/find.examples.js#L6-L9)
<!--/@-->

Result:

<!--@snippet('./examples/results/find-records-example.json', { showSource: true })-->
```json
{
  "data": [
    {
      "fieldData": {
        "name": "Anakin Skywalker",
        "image(1)": "",
        "object": "",
        "array": "",
        "height": "",
        "id": "8C970740-5DE9-4E40-8B7F-165E4253DD74",
        "imageName": "",
        "faceDescriptor": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "736975",
      "modId": "1"
    }
  ]
}
```

> File [./examples/results/find-records-example.json](./examples/results/find-records-example.json)
<!--/@-->

### Edit Records

The client's edit method requires a layout, recordId, and object to use for updating the record.

`client.edit(layout, recordId, data, parameters)`

<!--@snippet('./examples/edit.examples.js#edit-record-example', { showSource: true })-->
```js
const editRecord = client =>
  client
    .find('Heroes', [{ name: 'Anakin Skywalker' }], { limit: 1 })
    .then(response => response.data[0].recordId)
    .then(recordId => client.edit('Heroes', recordId, { name: 'Darth Vader' }))
    .then(result => log('edit-record-example', result));
```

> Excerpt from [./examples/edit.examples.js](./examples/edit.examples.js#L6-L11)
<!--/@-->

Result:

<!--@snippet('./examples/results/edit-record-example.json', { showSource: true })-->
```json
{
  "modId": "3"
}
```

> File [./examples/results/edit-record-example.json](./examples/results/edit-record-example.json)
<!--/@-->

### Delete Records

The client's delete method requires a layout and a record id.

`client.delete(layout, recordId, parameters)`

<!--@snippet('./examples/delete.examples.js#delete-record-example', { showSource: true })-->
```js
const deleteRecords = client =>
  client
    .find('Heroes', [{ name: 'yoda' }], { limit: 1 })
    .then(response => response.data[0].recordId)
    .then(recordId => client.delete('Heroes', recordId))
    .then(result => log('delete-record-example', result));
```

> Excerpt from [./examples/delete.examples.js](./examples/delete.examples.js#L6-L11)
<!--/@-->

Result:

<!--@snippet('./examples/results/delete-record-example.json', { showSource: true })-->
```json
{}
```

> File [./examples/results/delete-record-example.json](./examples/results/delete-record-example.json)
<!--/@-->

### Trigger Scripts

The client's script method requires a script to run and a layout to run on.

`client.script(layout, script, parameter)`

<!--@snippet('./examples/script.examples.js#script-trigger-example', { showSource: true })-->
```js
const triggerScript = client =>
  client
    .script('Heroes', 'FMS Triggered Script', { name: 'Han' })
    .then(result => log('script-trigger-example', result));
```

> Excerpt from [./examples/script.examples.js](./examples/script.examples.js#L6-L9)
<!--/@-->

Result:

<!--@snippet('./examples/results/script-trigger-example.json', { showSource: true })-->
```json
{
  "result": {
    "answer": "Han shot first"
  }
}
```

> File [./examples/results/script-trigger-example.json](./examples/results/script-trigger-example.json)
<!--/@-->

### Upload Files

The client's upload method will upload file data to a filemaker file. The upload method requires
a file path, layout, and container field name.

`client.upload(file, layout, containerFieldName, recordId, fieldRepetition)`

<!--@snippet('./examples/upload.examples.js#upload-image-example', { showSource: true })-->
```js
const uploadImage = client =>
  client
    .upload('./assets/placeholder.md', 'Heroes', 'image')
    .then(result => log('upload-image-example', result));
```

> Excerpt from [./examples/upload.examples.js](./examples/upload.examples.js#L6-L9)
<!--/@-->

Result:

<!--@snippet('./examples/results/upload-image-example.json', { showSource: true })-->
```json
{
  "modId": "1",
  "recordId": "740321"
}
```

> File [./examples/results/upload-image-example.json](./examples/results/upload-image-example.json)
<!--/@-->

You can also provide a record Id to the upload method and the file will be uploaded to that
record.

<!--@snippet('./examples/upload.examples.js#upload-specific-record-example', { showSource: true })-->
```js
          client
            .upload('./assets/placeholder.md', 'Heroes', 'image', recordId)
            .then(result => log('upload-specific-record-example', result)),
```

> Excerpt from [./examples/upload.examples.js](./examples/upload.examples.js#L20-L22)
<!--/@-->

Result:

<!--@snippet('./examples/results/upload-specific-record-example.json', { showSource: true })-->
```json
{
  "modId": "2",
  "recordId": "733109"
}
```

> File [./examples/results/upload-specific-record-example.json](./examples/results/upload-specific-record-example.json)
<!--/@-->

### Set Session Globals

You can also use the client to set FileMaker Globals for the session.

`client.globals(object)`

<!--@snippet('./examples/globals.examples.js#set-globals-example', { showSource: true })-->
```js
const setGlobals = client =>
	client
		.globals({ 'Globals::ship': 'Millenium Falcon' })
		.then(result => log('set-globals-example', result));
```

> Excerpt from [./examples/globals.examples.js](./examples/globals.examples.js#L6-L9)
<!--/@-->

Result:

<!--@snippet('./examples/results/set-globals-example.json', { showSource: true })-->
```json
{}
```

> File [./examples/results/set-globals-example.json](./examples/results/set-globals-example.json)
<!--/@-->

### Utility Methods

The client also provides utility methods to aid in parsing and manipulating FileMaker Data. The client exports the `recordId(data)`, `fieldData(data)`, and `transform(data, options)` to aid in transforming Data API response data into other formats. Each utility method is capable of recieving either an object or a array.

#### recordId Method

The recordId method retrieves the `recordId` properties for a response. This method will return either a single string or an array of strings.

`recordId(data)`

<!--@snippet('./examples/utility.examples.js#recordid-utility-example', { showSource: true })-->
```js
const extractRecordId = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => recordId(response.data))
    .then(result => log('recordid-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L7-L11)
<!--/@-->

Result:

<!--@snippet('./examples/results/recordid-utility-example.json', { showSource: true })-->
```json
[
  "733109",
  "733112"
]
```

> File [./examples/results/recordid-utility-example.json](./examples/results/recordid-utility-example.json)
<!--/@-->

#### fieldData Method

The fieldData method retrieves the `fieldData`, `recordId`, and `modId` properties from a Data API response. The fieldData method will merge the `recordId` and `modId` properties into fielData properties. This method will not convert `table::field` properties.

`fieldData(data)`

<!--@snippet('./examples/utility.examples.js#fielddata-utility-example', { showSource: true })-->
```js
const extractFieldData = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => fieldData(response.data))
    .then(result => log('fielddata-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L15-L19)
<!--/@-->

Result:

<!--@snippet('./examples/results/fielddata-utility-example.json', { showSource: true })-->
```json
[
  {
    "name": "yoda",
    "image(1)": "https://some-server.com/Streaming_SSL/MainDB/62CAD85E4B0A3850B1DC499C9D832B11C89DF41781C9409C5FDB45B482C3FE11?RCType=EmbeddedRCFileProcessor",
    "object": "",
    "array": "",
    "height": "",
    "id": "C5CC852A-EA14-2542-89EC-B947906C33B7",
    "imageName": "placeholder.md",
    "faceDescriptor": "",
    "recordId": "733109",
    "modId": "2"
  },
  {
    "name": "Yoda",
    "image(1)": "",
    "object": "",
    "array": "",
    "height": "",
    "id": "5A8422AE-FF84-DB46-8410-EE7B85DF03F5",
    "imageName": "",
    "faceDescriptor": "",
    "recordId": "733112",
    "modId": "1"
  }
]
```

> File [./examples/results/fielddata-utility-example.json](./examples/results/fielddata-utility-example.json)
<!--/@-->

#### Transform Method

The transform method converts Data API response data by converting `table::field` properties to objects. This method will transverse the response data and converting `{ table::field : value}` properties to `{ table:{ field : value } }`. The transform method will also convert `portalData` into arrays of objects. 

The transform method accepts three option properties. The three option properties are all booleans and true by default. The three option properties are `convert`,`fieldData`,`portalData`. The `convert` property controls the transfomation of `table::field` properties. The `fieldData` property controls the merging of fieldData to the result. The `portalData` property controls the merging of portalData to the result. Setting any propery to false its transformation off. 

`transform(data,options)`

<!--@snippet('./examples/utility.examples.js#transform-utility-example', { showSource: true })-->
```js
const transformData = client =>
  client
    .find('Transform', { name: 'Han Solo' }, { limit: 1 })
    .then(result => transform(result.data))
    .then(result => log('transform-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L23-L27)
<!--/@-->

Result:

<!--@snippet('./examples/results/transform-utility-example.json', { showSource: true })-->
```json
[
  {
    "starships": "",
    "vehicles": "",
    "species": "",
    "biography": "",
    "birthYear": "",
    "id": "193B8CEE-00CE-D942-92F0-FEEF4DA87967",
    "name": "Han Solo",
    "Planets": [
      {
        "recordId": "2",
        "name": "Coriella",
        "modId": "2"
      }
    ],
    "Vehicles": [
      {
        "recordId": "1",
        "name": "Millenium Falcon",
        "type": "Starship",
        "modId": "2"
      }
    ],
    "recordId": "732824",
    "modId": "3"
  }
]
```

> File [./examples/results/transform-utility-example.json](./examples/results/transform-utility-example.json)
<!--/@-->

## Tests

```sh
npm install
npm test
```

<!--@execute('npm run test',[])-->
```default
> fms-api-client@1.6.1 test /Users/luidelaparra/Documents/Development/fms-api-client
> nyc _mocha --recursive  ./tests --timeout=30000 --exit



  Authentication Capabilities
    ✓ should authenticate into FileMaker. (189ms)
    ✓ should automatically request an authentication token (182ms)
    ✓ should reuse a saved authentication token (176ms)
    ✓ should log out of the filemaker. (176ms)
    ✓ should not attempt a logout if there is no valid token.
    ✓ should reject if the logout request fails (177ms)
    ✓ should reject if the authentication request fails (1418ms)
    ✓ should attempt to log out before being removed (180ms)
    ✓ should catch the log out error before being removed if the login is not valid

  Create Capabilities
    ✓ should create FileMaker records. (188ms)
    ✓ should reject bad data with an error (83ms)
    ✓ should create records with mixed types (91ms)
    ✓ should substitute an empty object if data is not provided (86ms)
    ✓ should return an object with merged data properties (82ms)
    ✓ should allow you to run a script when creating a record with a merge response (90ms)
    ✓ should allow you to specify scripts as an array (106ms)
    ✓ should allow you to specify scripts as an array with a merge response (91ms)
    ✓ should sanitize parameters when creating a new record (89ms)
    ✓ should accept both the default script parameters and a scripts array (89ms)
    ✓ should remove an expired token (82ms)

  Delete Capabilities
    ✓ should delete FileMaker records. (267ms)
    ✓ should trigger scripts via an array when deleting records. (169ms)
    ✓ should trigger scripts via parameters when deleting records. (176ms)
    ✓ should allow you to mix script parameters and scripts array when deleting records. (168ms)
    ✓ should stringify script parameters. (169ms)
    ✓ should reject deletions that do not specify a recordId (82ms)
    ✓ should reject deletions that do not specify an invalid recordId (89ms)
    ✓ should remove an expired token (88ms)

  Edit Capabilities
    ✓ should edit FileMaker records.
    ✓ should reject bad data with an error (277ms)
    ✓ should return an object with merged filemaker and data properties
    ✓ should allow you to run a script when editing a record (184ms)
    ✓ should allow you to run a script via a scripts array when editing a record (181ms)
    ✓ should allow you to specify scripts as an array (180ms)
    ✓ should allow you to specify scripts as an array with a merge response (182ms)
    ✓ should sanitize parameters when creating a editing record (167ms)
    ✓ should accept both the default script parameters and a scripts array (163ms)
    ✓ should remove an expired token (167ms)

  FieldData Capabilities
    ✓ it should extract field data while maintaining the array (266ms)
    ✓ it should extract field data while maintaining the object (176ms)

  Find Capabilities
    ✓ should perform a find request (312ms)
    ✓ should allow you to use an object instead of an array for a find (205ms)
    ✓ should specify omit Criterea (133ms)
    ✓ should allow additional parameters to manipulate the results (87ms)
    ✓ should allow you to limit the number of portal records to return (82ms)
    ✓ should allow you to use numbers in the find query parameters (83ms)
    ✓ should allow you to sort the results (546ms)
    ✓ should return an empty array if the find does not return results (87ms)
    ✓ should allow you run a pre request script (94ms)
    ✓ should return a response even if a script fails (97ms)
    ✓ should allow you to send a parameter to the pre request script (90ms)
    ✓ should allow you run script after the find and before the sort (202ms)
    ✓ should allow you to pass a parameter to a script after the find and before the sort (209ms)
    ✓ should reject of there is an issue with the find request (115ms)
    ✓ should remove an expired token (97ms)

  Get Capabilities
    ✓ should get specific FileMaker records. (278ms)
    ✓ should reject get requests that do not specify a recordId (172ms)
    ✓ should allow you to limit the number of portal records to return (168ms)
    ✓ should accept namespaced portal limit and offset parameters (173ms)
    ✓ should remove an expired token (78ms)

  Global Capabilities
    ✓ should allow you to set session globals (186ms)
    ✓ should reject with a message and code if it fails to set a global (86ms)
    ✓ should remove an expired token (85ms)

  Request Interceptor Capabilities
    ✓ should reject if the server errors (124ms)
    ✓ should handle non JSON responses by rejecting with a json error (117ms)
    ✓ should reject non http requests to the server with a json error
 * Notice * Data API response does not contain a code. Only a message
    ✓ should reject non https requests to the server with a json error (139ms)

  List Capabilities
    ✓ should allow you to list records (303ms)
    ✓ should allow you use parameters to modify the list response (86ms)
    ✓ should should allow you to use numbers in parameters (103ms)
    ✓ should should allow you to provide an array of portals in parameters (90ms)
    ✓ should should remove non used properties from a portal object (85ms)
    ✓ should modify requests to comply with DAPI name reservations (85ms)
    ✓ should allow strings while complying with DAPI name reservations (79ms)
    ✓ should allow you to offset the list response (90ms)
    ✓ should santize parameters that would cause unexpected parameters (91ms)
    ✓ should allow you to limit the number of portal records to return (84ms)
    ✓ should accept namespaced portal limit and offset parameters (80ms)
    ✓ should reject invalid parameters (84ms)
    ✓ should remove an expired token (83ms)

  RecordId Capabilities
    ✓ it should extract the recordId while maintaining the array (273ms)
    ✓ it should extract recordId while maintaining the object (173ms)

  Script Capabilities
    ✓ should allow you to trigger a script (188ms)
    ✓ should allow you to trigger a script specifying a string as a parameter (87ms)
    ✓ should allow you to trigger a script specifying a number as a parameter (87ms)
    ✓ should allow you to trigger a script specifying an object as a parameter (100ms)
    ✓ should allow you to trigger a script in a find (222ms)
    ✓ should allow you to trigger a script in a list (92ms)
    ✓ should reject a script that does not exist (85ms)
    ✓ should allow return a result even if a script returns an error (90ms)
    ✓ should parse script results if the results are json (88ms)
    ✓ should not parse script results if the results are not json (92ms)
    ✓ should parse an array of scripts (98ms)
    ✓ should trigger scripts on all three script phases (94ms)
    ✓ should remove an expired token (82ms)

  Storage
    ✓ should allow an instance to be created
    ✓ should allow an instance to be saved.
    ✓ should reject if a client can not be validated
    ✓ should allow an instance to be recalled
    ✓ should allow insances to be listed
    ✓ should allow you to remove an instance

  Transform Capabilities
    ✓ should merge portal data and field data from an array (320ms)
    ✓ should merge portal data and field data from an object (122ms)
    ✓ should optionally not convert table::field keys from an array (123ms)
    ✓ should optionally not convert table::field keys from an object (125ms)
    ✓ should allow you to remove field data from an array (129ms)
    ✓ should allow you to remove field data from an object (121ms)
    ✓ should allow you to remove portal data from an array (135ms)
    ✓ should allow you to remove portal data from an object (128ms)
    ✓ should merge portal data and portal data from an array (128ms)

  File Upload Capabilities
    ✓ should allow you to upload a file to a new record (1358ms)
    ✓ should allow you to upload a file to a specific container repetition (1263ms)
    ✓ should reject with a message if it can not find the file to upload
    ✓ should allow you to upload a file to a specific record (1279ms)
    ✓ should allow you to upload a file to a specific record container repetition (1305ms)
    ✓ should reject of the request is invalid (236ms)
    ✓ should remove an expired token (85ms)

  Data Usage 
    Tracks Data Usage
      ✓ should track API usage data. (182ms)
      ✓ should allow you to reset usage data. (84ms)
    Does Not Track Data Usage
      ✓ should not track data usage in (248ms)
      ✓ should not track data usage out (83ms)

  Utility Capabilities
    Omit Utility
      ✓ it should remove properties while maintaing the array
      ✓ it should remove properties while maintaing the object
    Parse Utility
      ✓ it should return a string when given a string
      ✓ it should return an object when given a stringified object
    isJson Utility
      ✓ it should return true for an object
      ✓ it should return true for an empty object
      ✓ it should return true for a stringified object
      ✓ it should return false for a number
      ✓ it should return false for undefined
      ✓ it should return false for a string
      ✓ it should return false for null


  132 passing (22s)

------------------------------|----------|----------|----------|----------|-------------------|
File                          |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
------------------------------|----------|----------|----------|----------|-------------------|
All files                     |      100 |      100 |      100 |      100 |                   |
 fms-api-client               |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src           |      100 |      100 |      100 |      100 |                   |
  client.model.js             |      100 |      100 |      100 |      100 |                   |
  connection.model.js         |      100 |      100 |      100 |      100 |                   |
  credentials.model.js        |      100 |      100 |      100 |      100 |                   |
  data.model.js               |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
  request.service.js          |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src/utilities |      100 |      100 |      100 |      100 |                   |
  conversion.utilities.js     |      100 |      100 |      100 |      100 |                   |
  filemaker.utilities.js      |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
  transform.utilities.js      |      100 |      100 |      100 |      100 |                   |
 fms-api-client/tests         |      100 |      100 |      100 |      100 |                   |
  transform.tests.js          |      100 |      100 |      100 |      100 |                   |
------------------------------|----------|----------|----------|----------|-------------------|
```
<!--/@-->

<!--@dependencies()-->
## <a name="dependencies">Dependencies</a>

- [axios](https://github.com/axios/axios): Promise based HTTP client for the browser and node.js
- [form-data](https://github.com/form-data/form-data): A library to create readable "multipart/form-data" streams. Can be used to submit forms and file uploads to other web applications.
- [lodash](https://github.com/lodash/lodash): Lodash modular utilities.
- [marpat](https://github.com/luidog/marpat): A class-based ES6 ODM for Mongo-like databases.
- [moment](https://github.com/moment/moment): Parse, validate, manipulate, and display dates
- [object-sizeof](https://github.com/miktam/sizeof): Sizeof of a JavaScript object in Bytes
- [prettysize](https://github.com/davglass/prettysize): Convert bytes to other sizes for prettier logging

<!--/@-->

<!--@devDependencies()-->
## <a name="dev-dependencies">Dev Dependencies</a>

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [chai-as-promised](https://github.com/domenic/chai-as-promised): Extends Chai with assertions about promises.
- [colors](https://github.com/Marak/colors.js): get colors in your node.js console
- [coveralls](https://github.com/nickmerwin/node-coveralls): takes json-cov output into stdin and POSTs to coveralls.io
- [deep-map](https://github.com/mcmath/deep-map): Transforms nested values of complex objects
- [dotenv](https://github.com/motdotla/dotenv): Loads environment variables from .env file
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-google](https://github.com/google/eslint-config-google): ESLint shareable config for the Google style
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier): Turns off all rules that are unnecessary or might conflict with Prettier.
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier): Runs prettier as an eslint rule
- [fs-extra](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.
- [jsdoc](https://github.com/jsdoc3/jsdoc): An API documentation generator for JavaScript.
- [minami](https://github.com/Nijikokun/minami): Clean and minimal JSDoc 3 Template / Theme
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-lcov-reporter](https://github.com/StevenLooman/mocha-lcov-reporter): LCOV reporter for Mocha
- [mos](https://github.com/mosjs/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [mos-plugin-dependencies](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-execute](https://github.com/team-767/mos-plugin-execute): Mos plugin to inline a process output
- [mos-plugin-installation](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-installation): A mos plugin for creating installation section
- [mos-plugin-license](https://github.com/mosjs/mos-plugin-license): A mos plugin for generating a license section
- [mos-plugin-snippet](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [nyc](https://github.com/istanbuljs/nyc): the Istanbul command line interface
- [prettier](https://github.com/prettier/prettier): Prettier is an opinionated code formatter
- [varium](https://npmjs.org/package/varium): A strict parser and validator of environment config variables

<!--/@-->

<!--@license()-->
## License

MIT © Lui de la Parra
<!--/@-->
