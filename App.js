import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import Swiper from 'react-native-swiper';
import { Camera, Permissions, ImagePicker } from 'expo';
import { Font } from 'expo';

const styles = StyleSheet.create({
  wrapper: {},
  homeSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  firstSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eecdf5',
  },
  listSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9deb9d',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  recycle: {
    color: '#fff',
    fontSize: 45,
    fontWeight: 'bold',
    alignItems: 'center'
  },
  swipeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#303838',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    shadowOpacity: 0.35,
  },
  cameraIconStyle: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    width: 50,
    resizeMode: 'stretch',
  },
  raccoonIconStyle: {
    marginLeft: 20,
    marginRight: 20,
    height: 125,
    width: 125,
    resizeMode: 'stretch',
  },
  cameraLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    color: '#ffffff',
  },
 listTitle: {
    fontSize: 60,
    padding: 15,
    marginTop: 20,
    //fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    fontFamily: 'amaticSC',
    color: '#ffffff',
  },
  listItems: {
    fontSize: 35,
    marginLeft: 20,
    //fontWeight: 'bold',
    textAlign: 'center', 
    color: '#ffffff',
    fontFamily: 'JosefinSans-SemiBold',
  },
  listSubText: {
    fontSize: 25,
    marginLeft: 20,
    //fontWeight: 'bold',
    textAlign: 'center', 
    color: '#ffffff',
    fontFamily: 'JosefinSans-SemiBold'
  },
});

var keywords = ["Aerosol", "cans", "completely empty",
"Aluminum", "cans",  
"Beverage", "cans",
"Brochures",
"Cardboard", "cereal", "boxes", "plastic", "lining", "OK",
"Computer", "paper",
"Coupons",
"Egg", "cartons",
"Food", "cans",
"Glass", "bottles", "jars",
"Glass", "cosmetic", "bottles",
"Glass", "unbroken",
"Junk", "mail",
"Laundry", "bottles", "remove", "caps", "lids",
"Ledger", "paper", "drink",
"Magazines",
"Milk", "juice", "cartons",
"Newspaper",
"Paper", "product",
"Paper", "tubes",
"Phone", "books",
"Pizza", "boxes", "clean",
"Plastic",
"Tin", "cans",
"Tissue", "boxes",
"Used", "envelopes",
"Wrapping", "paper"]

export default class swiper extends Component {
  swiper = null;

  prev = () => {
    this.swiper.forceLeftSwipe();
  }

  next = () => {
    this.swiper.forceRightSwipe();
  }


  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    visible: false,
    fontLoaded : false,
    label: "Start at the home screen!",
    index: 2,
    isRecycle: "",
    currentWords : [],
    background: "#9deb9d"
  };
    async componentDidMount() {
      await Font.loadAsync({
      'amaticSC': require('./assets/fonts/AmaticSC-Bold.ttf'),
      'JosefinSans-SemiBold': require('./assets/fonts/JosefinSans-SemiBold.ttf'),
    })
    
    //this.setState({ fontLoaded: true});
  }
  
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  _handleButtonPress = () => {
    this.setState({
      type: this.state.type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back,
    });
  };
  
  _takePhoto = async () => {
    this.setState({ isRecycle: "" })
    this.setState({background: "#9deb9d"})
    this.setState({ currentWords: [] })
    const {
      cancelled,
      uri,
      base64,
    } = await ImagePicker.launchCameraAsync({
      base64: true,
    });
    if (!cancelled) {
      this.setState({
        imageUri: uri,
        label: '(loading...)',
        
      });
    }

    const body = {
      requests:[
        {
          image:{
            content: base64,
          },
          features:[
            {
              type: 'LABEL_DETECTION',
              maxResults: 2,
            }
          ]
        },
      ],
    };

    const response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=", { // don't steal my key
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const parsed = await response.json();
    var i, text, words = "";
    for (i = 0; i < 2; i++) { 
        text += parsed.responses[0].labelAnnotations[i].description + ": " + parsed.responses[0].labelAnnotations[i].score + "\n";
        words += parsed.responses[0].labelAnnotations[i].description
    }
    console.log(words);

    this.setState({
      label: text
    });
    
    function aContainsB (a, b) {
        return a.indexOf(b) >= 0;
    }

    var hasBeenSet = false;
    for (var j = 0; j < keywords.length; j++){
        if(aContainsB(words, keywords[j].toLowerCase())){
          console.log("reached!")
          this.setState({isRecycle: "Recyclable!"})
          hasBeenSet = true;
          break
        }
    }
    
    if(!hasBeenSet)
    {
      this.setState({isRecycle: "Not Recyclable..."})
      this.setState({background: "#ff6e6e"})
    }
  };
   
  _pickImage = async () => {
    this.setState({ isRecycle: "" })
    this.setState({background: "#9deb9d"})

    const {
      cancelled,
      uri,
      base64,
    } = await ImagePicker.launchImageLibraryAsync({
      base64: true,
    });
    if (!cancelled) {
      this.setState({
        imageUri: uri,
        label: '(loading...)',
        
      });
    }

    const body = {
      requests:[
        {
          image:{
            content: base64,
          },
          features:[
            {
              type: 'LABEL_DETECTION',
              maxResults: 2,
            }
          ]
        },
      ],
    };

    const response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=", { // eww
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const parsed = await response.json();
    console.log(parsed);
    var i, text, words="";
    for (i = 0; i < 2; i++) { 
        text += parsed.responses[0].labelAnnotations[i].description + ": " + parsed.responses[0].labelAnnotations[i].score + "\n";
        words += parsed.responses[0].labelAnnotations[i].description;
    }

    this.setState({
      label: text
    });
    
    function aContainsB (a, b) {
        return a.indexOf(b) >= 0;
    }
    
    var hasBeenSet = false;
    
    for (var j = 0; j < keywords.length; j++){
        if(aContainsB(words, keywords[j].toLowerCase())){
          this.setState({isRecycle: "Recyclable!"})
          hasBeenSet=true;
          break
        }
    }
    
    if(!hasBeenSet)
    {
      this.setState({isRecycle: "Not Recyclable..."})
      this.setState({background: "#ff6e6e"})
    }
  }
  
  render() {
    let imageView = null;
    if (this.state.imageUri) {
      imageView = (
        <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
             
        <Image
          style={{ width: 400, height: 400,
              justifyContent: 'center',
              alignItems: 'center', }}
          source={{ uri: this.state.imageUri }}
        />
        </View>
      );
    }

    let labelView = null;
    if (this.state.label) {
      labelView = (
        <View>
        <Text style={styles.swipeText}>
          {this.state.label}
        </Text>
        <Text style={styles.recycle}>
         {this.state.isRecycle}
        </Text>
        </View>
      );
      
    }
    return(
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        showsPagination={true}
        loop={false}
        index={1}
        ref={(swiper) => {
            this.swiper = swiper;
        }}
        >
         <View style={styles.firstSlide}>
          <ScrollView
            bounces={true}
            >
            <Text style={styles.listTitle}>Recyclable Items</Text>
            <Text style={styles.listItems}>Rigid Plastics/Bottles</Text>
            <Text style={styles.listSubText}>(Polyurethane containers, milk/juice jugs)</Text>
            <Text style={styles.listItems}>Cardboard</Text>
            <Text style={styles.listSubText}>(Cereal/Snack boxes, cardboard egg cartons, pizza boxes)</Text>
            <Text style={styles.listItems}>Paper </Text>
            <Text style={styles.listSubText}>(Phonebooks, magazines, mail, office paper, newspaper)</Text>
            <Text style={styles.listItems}>Metals</Text>
            <Text style={styles.listSubText}>(Tin, aluminum, and steel cans)</Text>
            <Text style={styles.listItems}>Glass</Text>
            <Text style={styles.listSubText}>(Food containers, jars, soft drinks, bottles)</Text>
            <Text style={styles.listTitle}>Non-Recyclable Items</Text>
            <Text style={styles.listItems}>Loose/Dirty Plastic</Text>
            <Text style={styles.listSubText}>(Used plastic utensils, plastic wrap, CDs/DVDs)</Text>
            <Text style={styles.listItems}>Polystyrene Foam Cups/Containers</Text>
            <Text style={styles.listSubText}>(Egg cartons, take out containers, drinking cups, packing peanuts)</Text>
            <Text style={styles.listItems}>Food Items</Text>
            <Text style={styles.listItems}>Textiles/Clothing</Text>
            <Text style={styles.listSubText}>(Fabric, cloth, shoes, blankets)</Text>
            <Text style={styles.listItems}>Other</Text>
            <Text style={styles.listSubText}>(broken or sharp glass, fast food packaging, medical supplies)</Text>
            
            <Text style={styles.listTitle}>FAQ</Text>
            <Text style={styles.listItems}>Where do I recycle?</Text> 
            <Text style={styles.listSubText}>If you don't have a neighborhood recycle bin, then find the closest recycling center to you on the internet.</Text>
            <Text style={styles.listItems}>How accurate is this app?</Text>
            <Text style={styles.listSubText}>This app uses the Google Cloud Computer Vision API to figure out what object is in the picture and so can only be as accurate as that allows. </Text>
            <Text style={styles.listItems}>Are you sure that was recyclable?</Text>
            <Text style={styles.listSubText}>We aren't perfect - yet. If you aren't sure about one of the results search on google to double check. </Text>
            <Text style={styles.listItems}>Why does this app say I'm recyclable?</Text>
            <Text style={styles.listSubText}>Odds are you wear glasses and the software picks up on that first, check the labels printed under the picture to see what the app is actually labelling recyclable.</Text>
            
          </ScrollView>
          </View>
        <View style={styles.homeSlide}>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Image
              source={require('./Images/raccoon.png')}
              style={styles.raccoonIconStyle}
              />
            <Text style={styles.text}> Let's Recycle!</Text>
            <Text style={styles.swipeText}>
              {' '}Snap or choose a pic{' '}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.5}
                onPress={this._takePhoto}>
                <Image
                  source={require('./Images/camera.png')}
                  style={styles.cameraIconStyle}
                />
              </TouchableOpacity>
              <Text style={styles.cameraLabel}> Camera </Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity style={styles.button} activeOpacity={0.5} onPress={this._pickImage}>
                <Image
                  source={require('./Images/gallery96.png')}
                  style={styles.cameraIconStyle}
                />
              </TouchableOpacity>
              <Text style={styles.cameraLabel}> Gallery </Text>
            </View>
          </View>
        </View>

        <View style={[styles.listSlide, {backgroundColor:this.state.background}]}>
          {imageView}
          {labelView}

        </View>

      </Swiper>
    );
  }
}
