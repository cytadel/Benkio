// @flow
import React from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, TouchableHighlight, View } from 'react-native'
import {SRDarkColor, SRYellowColor, SRBrightColor, SRRedColor} from './utilities/SRColors'

export default class SRTypographicCell extends React.Component {

  render() {
    const { children, onPressDetailsButton, onPressRateButton } = this.props
    const date = children.date.toUpperCase()
    return (
      <View style={styles.cell}>
        <TouchableHighlight
          style={styles.cellButton}
          underlayColor={'rgba(0, 0, 0, 0.04)'}
          onPress={onPressDetailsButton}>

          <View style={styles.cellData}>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.title}>{children.title}</Text>
            {this._renderNotes(children.notes != null && children.notes != '')}

            <View style={styles.touchableContainer}>
              <TouchableHighlight
                style={styles.ratingButton}
                underlayColor={'rgba(0, 0, 0, 0.06)'}
                onPress={onPressRateButton}>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonComponent} />
                  <View style={styles.buttonComponent} />
                  <View style={styles.buttonComponent} />
                </View>

              </TouchableHighlight>
            </View>

          </View>
        </TouchableHighlight>
      </View>
    )
  }

  _renderNotes = (flag) => {
    if(flag) {
      return (
        <Text style={styles.notes}>{this.props.children.notes}</Text>
      )
    } else {
      return null
    }
  }

}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: SRDarkColor,
    marginBottom:10,
  },
  cellButton: {
    flex: 1,
  },
  cellData: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  date: {
    color: SRRedColor,
    fontSize: 36,
    fontWeight: '500',
    // textDecorationLine: 'underline'
  },
  title: {
    color: SRBrightColor,
    fontSize: 48,
    fontWeight: '500',
    paddingTop: 20,
  },
  notes: {
    color: SRBrightColor,
    fontSize: 36,
    fontWeight: '300',
    paddingTop: 20,
  },
  touchableContainer: {
    flex: 1,
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButton: {
    flexShrink: 1,
    width:  44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  buttonComponent: {
    backgroundColor: SRYellowColor,
    borderRadius: 2,
    width: 10,
    height: 16,
    margin: 2,
  }
})
