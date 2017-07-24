// @flow

import React from 'react'
import {
  Button,
  Modal,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { StackNavigator } from 'react-navigation'
import expect from 'expect'
import moment from 'moment'
import { actionCreators } from './dataModel/SRSimpleDataModel'
import { SRSpacedRepetition } from './SRSpacedRepetition'
import SRStudyTaskEditor from './SRStudyTaskEditor'
import SRStudyListCell from './SRStudyListCell'
import SRRatingView from './SRRatingView'
import { SRSGrade } from './SRSpacedRepetition'
import { processDataForList } from './dataModel/SRDataPresenter'
import {SRDarkColor, SRYellowColor, SRBrightColor, SRRedColor} from './utilities/SRColors'
import SRTypographicCell from './SRTypographicCell'

const studyListTitle = 'Study List'

export default class SRStudyList extends React.Component {

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state
    return {
      // headerLeft: <Button title='⚙️' onPress={() => params.openSettings()} />,
      tabBarLabel: studyListTitle,
      tabBarIcon: ({ tintColor }) => (
        <Text>🔜</Text>
      ),
      headerTintColor: SRDarkColor,
      headerStyle: {
        backgroundColor: 'white'
      },
      title: studyListTitle,
    }
  }

  constructor() {
    super();
    const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: dataSource.cloneWithRows([]),
      modalVisible: false,
    };
  }

  componentWillMount() {
    const {store} = this.props.screenProps

    const {studyTasks} = store.getState()
    this.setState({studyTasks})
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(processDataForList(studyTasks))
    })

    this.unsubscribe = store.subscribe(() => {
      const {studyTasks} = store.getState()
      this.setState({studyTasks})
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(processDataForList(studyTasks))
      })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  componentDidMount() {
    // this.props.navigation.setParams({openSettings: this.openSettings})
  }

  componentWillReceiveProps(newProps) {

  }

  render() {
    const { dataSource, studyTasks } = this.state

    return (
      <View style={styles.container}>
        <ListView
          style={{backgroundColor: 'white'}}
          dataSource={dataSource}
          renderRow={(item) => {

            const d = new Date(item.date)
            const formattedDate = moment(d.getTime()).format('D MMM')

            if(true) {
              return (

                <SRTypographicCell
                  onPressDetailsButton={() => {
                    this.setState({
                      selectedID: item.id
                    })
                    this.navigateToDetails()
                    }
                  }
                  onPressRateButton={() => {
                    this.setState({
                      selectedID: item.id
                    })
                    this.openRatingUI()
                  }}
                >
                  {{title: item.taskName, notes: item.notes, date: formattedDate}}
                </SRTypographicCell>

              )
            } else {
              return (

                <SRStudyListCell
                  onPressDetailsButton={ () => {
                    this.setState({
                      selectedID: item.id
                    })
                    this.navigateToDetails()
                  }}
                >
                {{title: item.taskName, notes: item.notes, date: formattedDate}}
              </SRStudyListCell>

            )}
          }}
        />

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}
          >
         <SRRatingView
           dismissAction={() => this.setModalVisible(!this.state.modalVisible)}
           ratedCallback={(index) => this.rateTask(index)}
         />
        </Modal>

      </View>
    )
  }

  onAddTodo = (text: string) => {
    const {store} = this.props.screenProps

    store.dispatch(actionCreators.add(text))
  }

  onRemoveTodo = (index: number) => {
    const {store} = this.props.screenProps

    store.dispatch(actionCreators.remove(index))
  }

  openSettings = () => {

  }

  openRatingUI = () => {
    this.setModalVisible(true)
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  rateTask = (index) => {
    var grade = ''
    switch(index) {
      case 0:
        grade = SRSGrade.BAD
        break;
      case 1:
        grade = SRSGrade.OK
        break
      case 2:
        grade = SRSGrade.GOOD
        break
      default:
      throw "No valid rating selected"
        break
    }
    const { selectedID, dataSource } = this.state
    expect(selectedID).toExist('rateTask(): undefined id')
    const item = this.dataWithID(selectedID)

    // update SRS, rating history, date rated,
    item.ratingHistory.push(grade)

    const dateRated = new Date().toString()
    item.dates.push(dateRated)

    const { easinessFactor, interval, repetition } = item.srs
    const updatedSRS = new SRSpacedRepetition(easinessFactor, interval, repetition).grade(grade)
    expect(updatedSRS.easinessFactor).toNotEqual(easinessFactor)
    item.srs = updatedSRS

    const { store } = this.props.screenProps
    store.dispatch(actionCreators.replace(item))

    this.setModalVisible(false)
  }

  navigateToDetails = () => {
    const { selectedID } = this.state
    const { navigation } = this.props
    expect(selectedID).toExist('navigateToDetails(): Undefined id')
    const item = this.dataWithID(selectedID)
    navigation.navigate('DetailsView', {readonly: true, item: item})
  }

  dataWithID = (id) => {
    expect(id).toExist('dataWithID(): Undefined id')
    const { store } = this.props.screenProps
    const { studyTasks } = this.state
    const studyTasksCopy = [...studyTasks]
    const filteredArray = studyTasksCopy.filter((item) => item.id == id)
    expect(filteredArray.length).toBe(1, `Looking for data with id: ${id}. Item: ${JSON.stringify(studyTasksCopy)}`)
    const item = filteredArray[0]
    return item
  }

}

const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  }
})
