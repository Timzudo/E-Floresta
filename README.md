# E-Floresta

E-Floresta is a web and mobile platform developed by Martim Gouveia and Raquel Melo, that allows its users to register and manage plots of land efficiently.

Developed within the framework of the APDC course of the 3rd year of the Integrated Master in Computer Science at the Nova School Of Science & Technology, it was designed to assist the Municipality of Mação in the control and management of its land.


## The problem

The inland regions of Portugal are currently experiencing a population decline, as younger individuals move to the coast, leaving an aging population behind. This trend has serious economic, social, and environmental consequences, particularly with regards to forest management, which becomes increasingly difficult to afford. As a result, forest fires are becoming more frequent, leading to both economic and environmental losses. In response, the municipality of Mação is taking action to promote the integrated management of forest lands, which would allow for greater efficiency and reduced costs. The goal of the APDC 2022 project was to develop a web and mobile platform that enables landowners to register for and participate in this community initiative. The platform will also support the management of costs and income associated with forest management activities.


## Architecture

The platform was built on Google Cloud Platform, using Google App Engine, Datastore and Google Storage. Google Maps API was also utilized to provide the map services.

On the frontend, E-Floresta uses React, while the mobile implementation is built using Flutter, enabling cross-platform compatibility. To ensure security, E-Floresta employs JSON Web Tokens (JWT) and role-based access control. Other security measures are also in place to protect the platform against potential threats.

These technologies and tools were carefully selected to create a robust and scalable platform that can be used to manage plots efficiently and securely.


## Features

### Register a land parcel

![register](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODcyN2QzMTk3NjBhODA1OTVmNTg0OTA0YzM3ZWQ5NTkwZTc3ZjVlOCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/b8aJJb7C78HdtBy95j/giphy.gif)

With the option of importing a GeoJSON


### Details of a land parcel
![details](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGIyNGZjOGJjYzNlY2RjYjljNDI2MTQ3ZTk3NWQxYmE4Y2M5ODFhYyZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/GuG1HTYlul2sxpJ0FI/giphy.gif)

### Edit a land parcel
![edit](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjA1ODI4M2U3NDc4MDllNzY5Yzc0ZmFmY2QxNTE3NjdkN2Y1NTMwYyZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/wWMqMmLfX4nAprVFmV/giphy.gif)


### Statistics
![stats1](https://cdn.discordapp.com/attachments/723609492096549009/1100199229114306701/statistics.png)
![stats2](https://cdn.discordapp.com/attachments/723609492096549009/1100199228929749032/stats2.png)


### App
The app supports land parcel adition and visualization, while also allowing the user to set parcel limits while physically close to the borders of the parcel using gps without needing internet connection. 

![App1](https://cdn.discordapp.com/attachments/952962517418770472/998812691550453861/Screenshot_2022-07-19-05-32-28-879_com.example.startup.jpg)
![App2](https://cdn.discordapp.com/attachments/952962517418770472/998812761075236964/Screenshot_2022-07-19-05-33-02-955_com.example.startup.jpg)



#### Profile page with user information.
#### Multiple role based back-office tools for management and administration.
#### Point system to incentivize users to participate.
#### And many other features 





