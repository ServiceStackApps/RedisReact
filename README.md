# Redis React

Redis React is a simple user-friendly UI for browsing data in Redis servers which as it's built from
a [React Desktop Template](https://github.com/ServiceStackApps/ReactChatApps), it's available on 
multiple platforms including Windows, OSX, Linux or deployed as a Self-Hosting Console or ASP.NET Web Application.

Redis React takes advantage of the navigation and deep-linking benefits of a Web-based UI, the 
productivity and responsiveness of the [React framework](http://facebook.github.io/react/) 
and the rich native experiences and OS Integration possible from a Native Desktop Application.

## Rich support for JSON

Redis React is especially useful for browsing JSON values which includes a 
[human friendly view of JSON data](#category-item) and the ability to view multiple related keys together 
in a [tabular data grid](#view-as-grid) enabling fast inspection of redis data. 

At anytime you can click on the JSON preview to reveal the raw JSON string, or use the Global `t` 
shortcut key to toggle between preview mode and raw mode of JSON data. 

## [Live Demo](http://redisreact.servicestack.net/#/)

The Redis React App has been packaged for multiple platforms inc. the ASP.NET Live Demo 
[redisreact.servicestack.net](http://redisreact.servicestack.net/#/) deployed on AWS, 
you can use to preview Redis React browsing a redis server populated with the 
[Northwind Dataset](http://northwind.servicestack.net/) persisted as JSON following the
[Complex Type Conventions](http://stackoverflow.com/a/8919931/85785) built into the 
[C# ServiceStack.Redis Client](https://github.com/ServiceStack/ServiceStack.Redis).

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/home.png)](http://redisreact.servicestack.net/#/)

## Download

Use Redis React to browse your internal Redis Server by downloading the appropriate download for your platform.
Each application is available as a self-contained portable .exe that can be run as-is (without installation).

### Windows

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/download-windows10.png)](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact-winforms.exe)

To run on Windows, download the self-extracting Winforms App:

#### [RedisReact-winforms.exe](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact-winforms.exe) (23.9MB)

> Windows requires .NET 4.5 installed which is pre-installed on recent version of Windows

### OSX

To run on OSX, download the Cocoa OSX App:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/download-osx.png)](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact.AppMac.app.zip)

#### [RedisReact.AppMac.mono.app.zip](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact.AppMac.mono.app.zip) (16.5 MB) or without mono [RedisReact.AppMac.app.zip](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact.AppMac.app.zip) (4.1 MB)

The Cocoa OSX App was built with [Xamarin.Mac](https://developer.xamarin.com/guides/mac/getting_started/hello,_mac/)
and includes an embedded version of Mono which doesn't require an existing install of Mono. 

> Embedded Mono version conflicts with an existing Mono v4.0.3 installation, can upgrade Mono or use non-embedded version.

### Linux

To run on Linux, download the cross-platform Console App:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/download-linux.png)](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact-console.exe)

#### [RedisReact-console.exe](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact-console.exe) (5.4MB) or [RedisReact-console.exe.zip](https://github.com/ServiceStackApps/RedisReact/raw/master/dist/RedisReact-console.exe.zip) (1.7MB)

**RedisReact-console.exe** is a headless Console Application that can run on Windows, OSX and Linux 
platforms with .NET or Mono installed. Instead of being embedded inside a Native UI Desktop App, 
the Console Application starts a self-hosting HTTP server which it opens in the OS's default browser.

See the instructions for [Installing Mono on Linux](http://www.mono-project.com/docs/getting-started/install/linux/).
If installing via apt-get, it needs the **mono-complete** package to run.

## Update - 29 November 2015

### Connections with Authentication

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/updates/add-authentication.png)

Added support for password authentication when establishing connections with redis.

The **console** link now populates the console with the most appropriate command for each key type, e.g. clicking **console**
ok a Sorted Set Key (ZSET) populates the Web Console with `ZRANGE key 0 -1 WITHSCORES`

## Update - 27 October 2015

### Delete Actions

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/updates/delete-actions.png)

Delete links added on each key. Use the **delete** link to delete a single key or the **all** link to delete all
related keys currently being displayed.

### Expanded Prompt

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/updates/expanded-prompt.png)

Keys can now be edited in a larger text area which uses the full height of the screen real-estate available - 
this is now the default view for editing a key. Click the collapse icon when finished to return to the 
console for execution.

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/updates/expand-prompt.png)

All Redis Console commands are now be edited in the expanded text area by clicking on the Expand icon 
on the right of the console.

### Clear Search

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/updates/clear-search.png)

Use the **X** icon in the search box to quickly clear the current search.

# Features

## [Change Connection to Redis Server](http://redisreact.servicestack.net/#/connections)

By default Redis React will try to connect to a local instance of redis-server on `127.0.0.1:6379`, 
which can be changed at runtime on the [/connections](http://redisreact.servicestack.net/#/connections) page:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/connection.png)](http://redisreact.servicestack.net/#/connections)

> The Live Demo persists the 
[Northwind Dataset](http://northwind.servicestack.net/) 
on **DB 0** and test data for other Redis data structures on 
[DB 1](#search-db-1)

## Change Default AppSettings

You can also change the default connection by modifying the `appsettings.txt` in your User directory at:
```
C:\Users\MyUser\.redisreact/appsettings.txt   # Windows

/Users/MyUser/.redisreact/appsettings.txt     # OSX or Linux
```

> If preferred you can also put a copy of
[appsettings.txt](https://github.com/ServiceStackApps/RedisReact/blob/master/dist/appsettings.txt)
in the same directory where the application is run. 

## [Search](http://redisreact.servicestack.net/#/search)

Search lets you [SCAN](http://redis.io/commands/scan) the keyset in Redis using pattern support avialable in 
the [MATCH](http://redis.io/commands/scan#the-match-option) option. If no wildcard patterns are used a `*`
is explicitly added to the end of the query to allow for autocomplete of results while you type.

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/search.png)](http://redisreact.servicestack.net/#/search)

By default it returns the first **100** results and also displays summary info about each entry including 
the **Type** of key, **Size** of the value stored and when the Key **Expires** (if ever).

## [View JSON Value](http://redisreact.servicestack.net/#/keys?id=urn%3Aorder%3A10860&type=string)

Clicking on a Search Result will show you the value stored at that key, if the value is JSON it will show
a human-friendly view of the data, e.g:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/order.png)](http://redisreact.servicestack.net/#/keys?id=urn%3Aorder%3A10860&type=string)

You can click on the value to view the raw JSON instead or use the `t` shortcut key to toggle between views.

### Console and Edit

The **console** and **edit** links take you to the [Console](#console) with the command text box populated
with the appropriate **GET** or **SET** Redis command to view or modify the key.

### Similar Keys

The right sidebar shows a list of other similar keys you may want to look at next which you can navigate
by clicking the key or using the `Left` and `Right` arrow keys to navigate up/down the list.

### Key Hierarchy

When there's no Search query, the Sidebar instead lists the Search results of the parent key in the 
implicit hierarchy as separated by the chars `/ . :`. The resulting key parts are also used in
the title link of the selected key as a breadcrumb to navigate up the Key's Hierarchy, e.g:

**[urn](http://redisreact.servicestack.net/#/search?q=urn%3A*)** `:` **[order](http://redisreact.servicestack.net/#/search?q=urn%3Aorder%3A*)** `:` **10860**

## [Search Keys](http://redisreact.servicestack.net/#/search?q=urn%3Acategory)

By convention many keys sharing the same Key Hierarchy generally are of the same type making it an 
easy way to browse through related entries:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/search-category.png)](http://redisreact.servicestack.net/#/search?q=urn%3Acategory)

## [View as Grid](http://redisreact.servicestack.net/#/search?q=urn%3Acategory)

When keys share the same schema, clicking on the **view as grid** link lets you see multiple search results
displayed in a tabular data grid, e.g:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/category-grid.png)](http://redisreact.servicestack.net/#/search?q=urn%3Acategory)

## [Category Item](http://redisreact.servicestack.net/#/keys?id=urn%3Acategory%3A7&type=string)

Clicking on any of the results lets you view that item in more detail:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/category.png)](http://redisreact.servicestack.net/#/keys?id=urn%3Acategory%3A7&type=string)

> Use the **Left** and **Right** arrow keys to quickly browse through each category

## [View raw JSON Value](http://redisreact.servicestack.net/#/keys?id=urn%3Acategory%3A7&type=string)

Clicking on the preview result will let you toggle to see the underlying JSON value, e.g:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/category-rawmode.png)](http://redisreact.servicestack.net/#/keys?id=urn%3Acategory%3A7&type=string)

> Or use the **t** shortcut key to enable/disable preview mode globally

### Select All

Once view the JSON in **raw mode**, you can select all the JSON text by holding down 
**Shift** or **Ctrl** key and clicking anywhere on the JSON text.

## [Web Console](http://redisreact.servicestack.net/#/console)

The built-in Console takes advantage of a Web Based UI to provide some nice enhancements. E.g. each 
command is displayed on top of the result it returns, where clicking the command populates the text box
making it easy to execute or modify existing commands. Any **OK** Success responses are in green, whilst
any error responses are in red. Also just like JSON values above, it shows a human-friendly view for 
JSON data which can be clicked to toggle on/off individually: 

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/console.png)](http://redisreact.servicestack.net/#/console)

## [Entity References](http://redisreact.servicestack.net/#/keys?id=urn%3Aorder%3A10860&type=string)

This feature takes advantages of the POCO conventions built into the 
[C# ServiceStack.Redis Client](https://github.com/ServiceStack/ServiceStack.Redis) where it will 
automatically display any related entities for the current value, as seen with the related 
**Customer** the **Order** was for and the **Employee** who created it:

[![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/order-refs.png)](http://redisreact.servicestack.net/#/keys?id=urn%3Aorder%3A10860&type=string)

It works by scanning the JSON fields for names ending with **Id** then taking the prefix and using
it to predict the referenced key, e.g:

    CustomerId:FRANR => urn:customer:FRANR 

It then fetches all the values with the calculated key and displays them below the selected Order.
Clicking the **Customer** or **Employee** Key will navigate to that record, providing nice navigation
for quickly viewing a record and its related entities.

## Search DB 1 

The [redisreact.servicestack.net](http://redisreact.servicestack.net/#/) Live Demo also has some test
data on **DB 1** that lets you see what Redis's other data structures look like.
Where instead of showing the length of the String in bytes, it shows the number of elements in each 
collection.

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/db1-search.png)

## List Numbers

Clicking on a data structure just displays all items in the collection. Lists and Sets shows all its 
elements in a single column, e.g:

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/list-numbers.png)

## ZSet Letters

Whilst Sorted Sets and Hashes display its contents in 2 columns:  

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/zset-letters.png)

## Feedback Welcome!

We hope you enjoy using Redis React and it provides a great experience for browsing data in your 
Redis servers. Please leave any Feedback and 
[Feature Requests on UserVoice](http://servicestack.uservoice.com/forums/176786-feature-requests)!

# Implementation Notes

Despite its rich functionality and support for multiple OS and Web platforms, Redis React is a very simple 
React Web Application under the hood. It only uses the cross-platform
[ServiceStack Libraries](https://servicestack.net/download) for the entire Server implementation, whilst 
[CefSharp](https://github.com/cefsharp/CefSharp) is used in 
[Winforms project](https://github.com/ServiceStackApps/RedisReact/tree/master/src/RedisReact/RedisReact.AppWinForms)
to give Windows access to a modern Web Browser in Chromium.

The entire server implementation is contained in the single
[RedisServices.cs](https://github.com/ServiceStackApps/RedisReact/blob/master/src/RedisReact/RedisReact.ServiceInterface/RedisServices.cs)
ServiceStack Service. 

On the Client side all Ajax calls are made via the single
[redis.js](https://github.com/ServiceStackApps/RedisReact/blob/master/src/RedisReact/RedisReact/js/redis.js).
What remains is a simple React App composed of a few straight-forward
[JSX React Components](https://github.com/ServiceStackApps/RedisReact/tree/master/src/RedisReact/RedisReact/js/components)
and 
[Reflux Data Stores](https://github.com/ServiceStackApps/RedisReact/blob/master/src/RedisReact/RedisReact/js/stores.js).

### [React Desktop Apps](https://github.com/ServiceStackApps/ReactDesktopApps)

[![React Desktop Apps](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/gap/react-desktop-splash.png)](https://github.com/ServiceStackApps/ReactDesktopApps)

The heavy lifting for packaging the React App is encapsulated in 
[ServiceStackVS](https://github.com/ServiceStack/ServiceStackVS) new
[React Desktop Apps](https://github.com/ServiceStackApps/ReactDesktopApps) VS.NET Template.

Where most of the development is done on a modern
[ASP.NET React Project](https://github.com/ServiceStackApps/Chat-React#modern-reactjs-apps-with-net) 
which utilizes an optimal development workflow, bower for client dependencies and Grunt/Gulp tasks 
for website bundling, optimizations and deployment.

What the **React Desktop Apps** template adds in addition are the necessary Grunt tasks to package the 
ASP.NET Web Application into a self-hosted HttpListener Console Application that's ILMerged into 
[a single cross-platform .exe](https://github.com/ServiceStack/ServiceStack.Gap).

The Windows project takes that 1 step further and wraps the stand-alone Server and embeds it inside a 
Winforms application, using the Chromium Web Browser in CefSharp to render the Web UI. Since CefSharp 
contains native .dlls it can't be ILMerged so instead the Grunt task uses the 
[7zip SFX support](http://www.7-zip.org/links.html) to create a self-extracting executable.

Also included is **04-deploy-webapp** Grunt task to 
[optimize, package and deploy](https://github.com/ServiceStackApps/Chat-React#reactjs-app-deployments)
the primary ASP.NET Web Application using MS WebDeploy using the details contained in 
`/wwwroot_build/publish/config.json` which we use to deploy to 
[redisreact.servicestack.net](http://redisreact.servicestack.net)

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/gap/react-desktop-tasks.png)

### Xamarin.Mac OSX Template

The VS .NET Template also generates a OSX Cocoa Xamarin.Mac project, but this needs to be built on 
OSX using [Xamarin.Mac](https://xamarin.com/mac). One nice feature it has is being able to embed the
Mono runtime in the application bundle so the resulting OSX App can run without needing Mono installed! 

![](https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/redis-react/xamarin-link-mono.png)


