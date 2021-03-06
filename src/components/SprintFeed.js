/* eslint-disable semi */
/* eslint-disable prettier/prettier */


import React, { Component } from 'react';
import { connect } from 'react-redux'
import { StyleSheet, SafeAreaView, TouchableHighlightBase, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import { endSprint, startSprint } from '../actions/fetchSprint'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Button, View, Text, Subtitle} from '@shoutem/ui';
import ListChores from './ListChores'
import Modal from './Modal'
import Loading from './Loading'




class SprintFeed extends Component {
    constructor() {
        super() 
        this.state = {
            showModal: false, 
            loading: false
        }
    }

    createAlert = () => {
        Alert.alert(
            'Sprint now active!', 
            'Finish as many tasks as you can...', 
            [
                {
                    text: 'Ok',  onPress: () => console.log("OK Pressed") 
                }
            ],
            { cancelable: false }
        )
    }

    createAlertRejection = () => {
        Alert.alert(
            "Consensus wasn't reached!", 
            'Cast your vote again and and see if your RUMIS agree this time!', 
            [
                {
                    text: 'Ok',  onPress: () => console.log("OK Pressed") 
                }
            ],
            { cancelable: false }
        )
    }

    completionStatus = () => {
        let count  = 0;
        this.props.sprintChores.map(chore =>{
           if(chore.completion_status) {
               count +=1
           }
        })
        let percentage = ( count / this.props.sprintChores.length ) * 100 
        percentage = Math.round(percentage * 100) / 100
        // why does this cause an infinite re rendering loop???????
        // this.completionStatus() after render
        // this.setState({
        //     completion: percentage
        // })
        return percentage
    }

    endSprint = () => {
        let d = new Date()
        let date = d.getDate()
        let month = d.getMonth()
        let year = d.getFullYear() 
        let dateStr = `${year}-${month}-${date}`

        let data = {
            end_date: dateStr, 
            completion_status: true, 
            active: false
        }

        // console.log(data, 'DATA')
        // console.log(dateStr, 'DATE STRING!!!!!')
        // console.log(this.props.sprint.id, 'SPRINT ID LASKDJALSKDJALSKDJASLKJDKADJKLD')



        const configObj = {
            method: 'PATCH', 
            headers : {
              'Content-Type' : 'application/json', 
              'Accept' : 'application/json'
            }, 
            body: JSON.stringify(data)
          }

        fetch(`http://localhost:3000/sprints/${this.props.sprint.id}`, configObj)
        .then(response => response.json())
        .then(data => {
            this.props.end(data)
        })
    }
    goToHome = () => {
        console.log('GOING HOME!!!!')
        
    }

    complete = () => {
        this.setState({
            showModal: true
        })
    }

     closeModal = () =>{
         this.setState({
             showModal: false
         })
     }

    startSprint = () => {
        this.setState({
            loading: true
        })
        let d = new Date()
        let date = d.getDate()
        let month = d.getMonth()
        let year = d.getFullYear() 
        let dateStr = `${year}-${month}-${date}`

        let data = {
            begin_date: dateStr,
            house_id: this.props.house.id
        }

        const configObj = {
            method: 'POST', 
            headers : {
              'Content-Type' : 'application/json', 
              'Accept' : 'application/json'
            }, 
            body: JSON.stringify(data)
        }

        fetch(`http://localhost:3000/sprints/`, configObj)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            this.props.start(data)
            this.setState({
                loading: false
            })
        })
        
    }

    confirmSprint =() => {
        console.log('CONFIRMING SPRINT')

        let data = {
            sprint_id: this.props.sprint.id, 
            user_id: this.props.user.id, 
            house_id: this.props.house.id
        }
        const configObj = {
            method: 'POST', 
            headers : {
              'Content-Type' : 'application/json', 
              'Accept' : 'application/json'
            }, 
            body: JSON.stringify(data)
        }

        fetch(`http://localhost:3000/sprints/confirm`, configObj)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            this.props.start(data)
            if(this.props.sprint.active && this.props.sprint.approval){
                this.createAlert()
            }
        })

    }

    rejectSprint = () => {
        console.log('REJECTING SPRINT')

        let data = {
            sprint_id: this.props.sprint.id, 
            user_id: this.props.user.id, 
            house_id: this.props.house.id
        }
        const configObj = {
            method: 'POST', 
            headers : {
              'Content-Type' : 'application/json', 
              'Accept' : 'application/json'
            }, 
            body: JSON.stringify(data)
        }

        fetch(`http://localhost:3000/sprints/reject`, configObj)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            this.props.start(data)
        })

        //consensus wasn't reached! Cast you vote again and see if your RUMIS agree this time!
    }
    
    componentDidUpdate (prevProps, prevState) {
        if(prevProps.sprint.id !== this.props.sprint.id && !prevProps.sprint.completion_status){
            this.createAlertRejection()
            
        }
    }
    displayConfirmOrReject = () => {
        let mySprintChores = this.props.sprintChores.filter( sprintChore => sprintChore.user.id === this.props.user.id)
        let booleans = mySprintChores.filter( sprintChore => {
            if( sprintChore.accepted ){
                return true 
            } else if ( sprintChore.rejected) {
                return true 
            }
        })
        console.log(booleans)
        return booleans
    }

    render() {
        let percentage = this.completionStatus()
        let conditional = this.displayConfirmOrReject()

        if (this.state.loading){
            return <Loading isVisible = {true} text= 'LOADING'/>
        }

        if (this.props.sprint.begin_date && !this.props.sprint.completion_status && this.props.sprint.active ) {
            return (
                <View style={styles.main}>
                    <TouchableOpacity style={styles.houseImage} onPress = {()=> this.goToHome()}>
                        <Image style ={styles.img}
                        PlaceholderContent = {<ActivityIndicator color = '#fff' />}
                        resizeMode={'stretch'}
                        source={
                            this.props.house.img
                            ? {uri: this.props.house.img}
                            : {uri: '' }
                        }
                        />
                    </TouchableOpacity>
                    <View style={styles.completionBar}>
                        <AnimatedCircularProgress
                            size={150}
                            width={15}
                            fill={ percentage }
                            tintColor="#00e0ff"
                            onAnimationComplete={() => console.log('onAnimationComplete')}
                            backgroundColor="#3d5875">
                            {
                                (fill) => (
                                <Text>
                                {percentage} % of Tasks 
                                </Text>
                                )
                            } 
                        </AnimatedCircularProgress>
                    </View>
                    {
                        this.props.user.admin === true ?
                        
                    <View styleName="horizontal h-center">
                            <Button styleName="secondary"  onPress = { () => this.complete()}>
                                <Text> END SPRINT</Text>
                            </Button>
                            <Modal isVisible={this.state.showModal} setIsVisible = {this.closeModal}>
                                <Subtitle styleName='bold h-center md-gutter-vertical'> ARE YOU SURE YOU WANT TO END SPRINT? </Subtitle>
                                <View styleName="horizontal">
                                        <Button  styleName="confirmation secondary" onPress = {() => this.endSprint()}>
                                            <Text>YES</Text>
                                        </Button>
                                        <Button styleName="confirmation secondary" onPress ={() => this.closeModal()}>
                                            <Text>NO</Text>
                                        </Button>
                                </View>
                            </Modal>
                    </View>
                        : null
                    }
              </View>
            )
        } else if (this.props.user.admin && this.props.sprint.completion_status) {
            return (
                <View style={styles.main}>
                    <TouchableOpacity style={styles.houseImage} onPress = {()=> this.goToHome()}>
                        <Image style ={styles.img}
                        resizeMode={'stretch'}
                        PlaceholderContent = {<ActivityIndicator color = '#fff' />}
                        source={
                            this.props.house.img
                            ? {uri: this.props.house.img}
                            : {uri: '' }
                        }
                        />
                    </TouchableOpacity>
                        <View style={styles.completionBar}>
                            <Subtitle styleName='md-gutter-vertical'>PREVIOUS SPRINT COMPLETION </Subtitle>
                            <AnimatedCircularProgress
                                size={150}
                                width={15}
                                fill={ percentage }
                                tintColor="#00e0ff"
                                onAnimationComplete={() => console.log('onAnimationComplete')}
                                backgroundColor="#3d5875">
                                {
                                    (fill) => (
                                    <Text>
                                    {percentage} % of Tasks 
                                    </Text>
                                    )
                                } 
                            </AnimatedCircularProgress>
                        </View>
                    <View styleName="horizontal h-center">
                        <Button styleName="secondary"  onPress = { () => this.startSprint()}>
                            <Text> START SPRINT</Text>
                        </Button>
                    </View>
   
                </View>
            );
        }  else if (!this.props.sprint.active ) {
            return (
                <View style={styles.main}>
                        <TouchableOpacity style={styles.houseImage} onPress = {()=> this.goToHome()}>
                            <Image style ={styles.img}
                            PlaceholderContent = {<ActivityIndicator color = '#fff' />}
                            resizeMode={'stretch'}
                            source={
                                this.props.house.img
                                ? {uri: this.props.house.img}
                                : {uri: '' }
                            }
                            />
                        </TouchableOpacity>
                        <View styleName="horizontal">
                            {conditional.length >= 1 ?
                            (
                                <Button  styleName="confirmation secondary">
                                    <Text>WAITING FOR RUMI VOTES</Text>
                                </Button>
                            ) :

                            (
                                <View styleName="horizontal">
                                    <Button  styleName="confirmation secondary h-center" onPress = {() => this.confirmSprint()}>
                                        <Text>CONFIRM SPRINT</Text>
                                    </Button>
                                    <Button styleName="confirmation secondary" onPress ={() => this.rejectSprint()}>
                                        <Text>REJECT SPRINT</Text>
                                    </Button>
                                </View>
                            )
                            }
   
                        </View>
                        <ListChores chores={this.props.sprintChores}/>
                </View>
            )
        }
        else {
            return(
                <View style={styles.main}>
                    <TouchableOpacity style={styles.houseImage} onPress = {()=> this.goToHome()}>
                        <Image style ={styles.img}
                        PlaceholderContent = {<ActivityIndicator color = '#fff' />}
                        resizeMode={'stretch'}
                        source={
                            this.props.house.img
                            ? {uri: this.props.house.img}
                            : {uri: '' }
                        }
                        />
                    </TouchableOpacity>
                        <View style={styles.completionBar}>
                            <Subtitle styleName="bold">HOUSE COMPLETION </Subtitle>
                            <Subtitle styleName="bold"> LAST SPRINT </Subtitle>
                            <AnimatedCircularProgress
                                size={150}
                                width={15}
                                fill={ percentage }
                                tintColor="#00e0ff"
                                onAnimationComplete={() => console.log('onAnimationComplete')}
                                backgroundColor="#3d5875">
                                {
                                    (fill) => (
                                    <Text>
                                    {percentage} % of Tasks 
                                    </Text>
                                    )
                                } 
                            </AnimatedCircularProgress>
                        </View>
                        <View styleName='horizontal h-center'>
                            <Subtitle styleName="bold">ASK ADMIN TO START NEW SPRINT </Subtitle>
                        </View>
                </View>
            )

        }
    }
  }



const mapStateToProps = (state) => {
    return {
        chores: state.chores,
        house: state.house, 
        sprint: state.sprint, 
        roomies: state.roomies, 
        user: state.auth,
        sprintChores: state.sprintChores
    }
}

const mapDispatchToProps = dispatch => {
    return {
        end: data => dispatch(endSprint(data)), 
        start: data => dispatch(startSprint(data)),
    };
  };


export default connect(mapStateToProps, mapDispatchToProps)(SprintFeed)



const styles = StyleSheet.create({
    main: {
        backgroundColor: '#fff', 
        flex: 1
    },
    middle: {
        justifyContent: 'center', 
        alignItems: 'center', 
        flex: 1
      },
    loader: {
        marginTop:10,
        marginBottom: 10,
        alignItems: 'center',
    }, 
    viewChore: {
        flexDirection: 'row', 
        marginLeft: 15,
        marginBottom: 50,
    }, 
    choreName: {
        fontWeight: 'bold',
    }, 
    houseImage : {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    }, 
    img: {
        width: 110,
        height: 90,
        borderRadius: 40,
    }, 
    choreDescription : {
        padding: 5,
        width: 300,
    }, 
    completionBar: {
        margin: 20, 
        alignItems: 'center', 
        justifyContent: 'center'
    }, 
    buttonStyle: {
        width: 400,
        alignItems: 'center', 
        justifyContent: 'center'
    }
})