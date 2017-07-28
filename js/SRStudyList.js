// @flow
import React from 'react'
import {
  Alert,
  Animated,
  ListView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import expect from 'expect'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';

import SRRatingView from './SRRatingView'
import SRStudyListCell from './SRStudyListCell'
import SRTypographicCell from './SRTypographicCell'
import { SRSGrade } from './SRSpacedRepetition'
import { processDataForList } from './dataModel/SRDataPresenter'
import { SRDarkColor, SRYellowColor, SRBrightColor, SRRedColor } from './utilities/SRColors'
import { formatCellDate } from './utilities/SRDateFormat'
import SREmptyStateHeader from './components/SREmptyStateHeader'
import SREmptyState from './components/SREmptyState'

export const studyListTitle = 'Reviews'

class SRStudyList extends React.Component {

  state: {
    dataSource: ListView.DataSource,
    ratingModalisVisible: bool,
    renderEmptyStateHeader: bool,
    emptyStateTableDistanceFromBottom: number,
    selectedID: string,
    listViewHeight: number,
    onlyTypographicCellHeight: number,
  }

  constructor(props: Object) {
    super(props);
    const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      dataSource: dataSource.cloneWithRows([]),
      ratingModalisVisible: false,
      selectedID: '',
      renderEmptyStateHeader: false,
      emptyStateTableDistanceFromBottom: 0,
      listViewHeight: 0,
      onlyTypographicCellHeight: 0,
    }

  }

  componentWillMount() {
    this.updateUIStates(this.props)
    this.ratingViewSpringAnimation = new Animated.Value(0)
    this.ratingViewOpacityAnimation = new Animated.Value(0)
  }

  componentWillReceiveProps(newProps: Object) {
    this.updateUIStates(newProps)
  }

  render() {
    const {
      dataSource,
      renderEmptyStateHeader,
      ratingModalisVisible,
    } = this.state

    return (
      <View style={styles.container}>
        {this._renderEmptyStateHeader(renderEmptyStateHeader)}
        <ListView
          contentContainerStyle={styles.tableViewContainer}
          style={styles.tableView}
          dataSource={dataSource}
          enableEmptySections={true}
          onLayout={(event) => {
            const {x, y, width, height} = event.nativeEvent.layout
            this.setState({listViewHeight: height}) // only called once when it changes
          }}
          renderRow={(item, sectionID, rowID, highlightRow) => {

            const d = new Date(item.date)
            const itemIsOverDue = new Date() > d
            const itemIsToday = d.toDateString() == new Date().toDateString()
            const allowRating = itemIsToday || itemIsOverDue
            const formattedDate = formatCellDate(d)

            if(allowRating) {
              return (
                // needs wrapper because onLayout doesn't get called on SRTypographicCell for some reason
                <View style={{flex:1}}
                  onLayout={(event) => {
                    const {x, y, width, height} = event.nativeEvent.layout
                    if(rowID == 0) {
                      this.setState({onlyTypographicCellHeight: height}) // only called once when it changes
                    }
                  }}>
                  <SRTypographicCell
                    onPressDetailsButton={() => this.navigateToDetails(item)}
                    onPressRateButton={() => this.rateItem(item.id)}
                  >
                    {{title: item.taskName, notes: item.notes, date: formattedDate}}
                  </SRTypographicCell>
                </View>
              )
            } else {
              return (

                <SRStudyListCell
                  onPressDetailsButton={() => this.navigateToDetails(item)}
                >
                {{title: item.taskName, notes: item.notes, date: formattedDate}}
              </SRStudyListCell>

            )}
          }}
        />

        {this._renderEmptyStateTable()}

        <Modal
          animationType={"none"}
          transparent={true}
          visible={ratingModalisVisible}
          >
          <Animated.View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'stretch',
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: 'rgba(4, 4, 4, 0.77)',
            opacity: this.ratingViewOpacityAnimation,
          }}>
            <Animated.View style={{
              transform: [{
                scaleX: this.ratingViewSpringAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                })},
                {
                scaleY: this.ratingViewSpringAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                })
              }]
            }}>
            <SRRatingView
              dismissAction={() => this.setRatingModalVisible(false)}
              ratedCallback={(index) => this.rateTask(index)}
            />
            </Animated.View>
          </Animated.View>

        </Modal>


      </View>
    )
  }

  // UI state

  updateUIStates = (props) => {
    const { tableData, studyTasks } = props

    const noDataYet = tableData.length == 0
    var showEmptyStateHeader = false

    if(noDataYet) {
      showEmptyStateHeader = true
    } else {
      const firstItem = tableData[0]
      const onlyFutureTasks = (new Date(firstItem.date) > new Date())
      if(onlyFutureTasks) {
        showEmptyStateHeader = true
      }
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(tableData),
      renderEmptyStateHeader: showEmptyStateHeader,
    })
  }

  _renderEmptyStateHeader = (flag) => {
    if(flag) {
      return (
        <SREmptyStateHeader />
      )
    } else {
      return null
    }
  }

  _renderEmptyStateTable = () => {
    const { listViewHeight, onlyTypographicCellHeight } = this.state
    const { tableData } = this.props

    var shouldRender = false
    var bottom = 0

    if(listViewHeight != 0) {
      const { studyTasks } = this.props
      const noDataYet = tableData.length == 0

      if(noDataYet) {
        shouldRender = true
        bottom = listViewHeight / 2
      } else {
        const firstItem = tableData[0]
        const onlyFutureTasks = (new Date(firstItem.date) > new Date())

        if(onlyFutureTasks) {

        } else {
          if(tableData.length == 1 && onlyTypographicCellHeight != 0) {
            shouldRender = true
            bottom = (listViewHeight - onlyTypographicCellHeight) / 2
          }
        }
      }
    }

    if(shouldRender) {
      return (
        <View style={{
          position: 'absolute',
          alignItems: 'center',
          right: 0,
          left: 0,
          bottom:  bottom,
        }}>
          <SREmptyState />
        </View>
      )
    } else {
      return null
    }
  }

  rateItem = (id: string) => {
    this.setState({selectedID: id})
    this.setRatingModalVisible(true)
  }

  setRatingModalVisible(visible: bool) {
    if(visible) {
      this.setState({ratingModalisVisible: visible});
    }

    Animated.parallel([
      Animated.spring(
        this.ratingViewSpringAnimation,
        {
          toValue: visible ? 1 : 0,
          speed: 12,
          bounciness: 10,
        }
      )
      ,
      Animated.timing(
        this.ratingViewOpacityAnimation,
        {
          duration: 400,
          toValue: visible ? 1 : 0,
        })
    ]).start(() => {
      if(!visible) {
        this.setState({ratingModalisVisible: visible});
      }
    })
  }

  rateTask = (index: number) => {
    var grade = -1
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
    }
    const { rateAction } = this.props
    const { selectedID } = this.state
    rateAction(selectedID, grade)
    this.setRatingModalVisible(false)
  }

  navigateToDetails = (item: any) => {
    const { navigationAction } = this.props
    navigationAction(item)
  }

}

SRStudyList.propTypes = {
  rateAction: PropTypes.func,
  navigationAction: PropTypes.func,
}

const mapStateToProps = (state) => {
    return {
        studyTasks: state.studyTasks,
        tableData: processDataForList(state.studyTasks)
    }
}

export default connect(mapStateToProps)(SRStudyList)

const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  tableView: {
    backgroundColor: SRBrightColor,
  },
  tableViewContainer: {
    paddingBottom: 90,
  },
})
