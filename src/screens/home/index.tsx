import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ToastAndroid,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  insertNewItem,
  deleteItem,
  queryAllItems,
  updateItem,
} from '../../realm/Realm';
import styles from './styles';
import {SwipeListView} from 'react-native-swipe-list-view';
import {todoItem} from '../..//interfaces';
import Modal from 'react-native-modal';

// some configurations for animations
const rowSwipeAnimatedValues: any = {};
Array(100)
  .fill('')
  .forEach((_, i) => {
    rowSwipeAnimatedValues[`${i}`] = new Animated.Value(0);
  });

const HomeScreen: FC = () => {
  const [animationIsRunning, setAnimationIsRunning] = React.useState(false); // detect if animation is running
  const [todos, setTodos] = useState<[] | any>([]); // all the todos items
  const [visible, setVisible] = useState<boolean>(false); // controls the visibality of the modal
  const [title, setTitle] = useState<string>(''); // title of the selected item
  const [compeleted, setCompeleted] = useState<boolean>(false); // completed status of the selected item
  const [isUpdate, setIsUpdate] = useState<boolean>(false); // render the component for update or new insert
  const [idToupdate, setIdToUpdate] = useState<number>(0); // id of the selected item
  const [menuView, setMenuView] = useState<boolean>(false); // controls the view of the items  menu | list

  // return the component to the default state
  const cleanState = () => {
    setTitle('');
    setCompeleted(false);
    setIsUpdate(false);
    setIdToUpdate(0);
  };

  // open the model when pressing the FAB buttom
  const handleFab = () => {
    cleanState();
    setVisible(true);
  };

  // prepare the component for making a new update
  // also changes the ui based on this status
  const handleUpdate = (item: todoItem) => {
    setIsUpdate(true);
    setIdToUpdate(item.id);
    setTitle(item.title);
    setCompeleted(item.compeleted);
    setVisible(true);
  };

  // closes the modal
  const handleDismiss = () => {
    setVisible(false);
    cleanState();
  };

  // get all todo items from the database
  const getToDos = useCallback(async () => {
    const response = await queryAllItems();
    setTodos(response);
  }, []);

  // when the components first mounts
  // get all the items from the database
  useEffect(() => {
    getToDos();
  }, [getToDos]);

  // Add a new item to the database
  const AddItem = async () => {
    let newItem = {
      title,
      compeleted,
    };
    await insertNewItem(newItem)
      .then(() => {
        {
          Platform.OS === 'android' &&
            ToastAndroid.show('Item added !', ToastAndroid.SHORT);
        }
        cleanState();
        getToDos();
      })
      .catch((error) => {
        Alert.alert(`Insert new Item error ${error}`);
      });
  };

  // Update an already existing item from the database
  const UpdateItem = async () => {
    let newItem = {
      id: idToupdate,
      key: idToupdate.toString(),
      title,
      compeleted,
    };
    await updateItem(newItem)
      .then(() => {
        {
          Platform.OS === 'android' &&
            ToastAndroid.show('Item upddated !', ToastAndroid.SHORT);
        }
        cleanState();
        getToDos();
      })
      .catch((error) => {
        Alert.alert(`Insert new Item error ${error}`);
      });
  };

  // change the status of the todo item to  completed | not compeleted
  const CompleteItem = async (item: todoItem) => {
    const {id, key, title, compeleted} = item;
    let newItem = {
      id,
      key,
      title,
      compeleted: !compeleted,
    };
    await updateItem(newItem)
      .then(() => {
        {
          Platform.OS === 'android' &&
            ToastAndroid.show('Item upddated !', ToastAndroid.SHORT);
        }
        getToDos();
      })
      .catch((error) => {
        Alert.alert(`Insert new Item error ${error}`);
      });
  };

  // delete an item from the database
  const DeleteItem = async (id: number) => {
    await deleteItem(id)
      .then(() => {
        {
          Platform.OS === 'android' &&
            ToastAndroid.show('Item deleted !', ToastAndroid.SHORT);
        }
        getToDos();
      })
      .catch((error) => {
        Alert.alert(`Delete new Item error ${error}`);
      });
  };

  // closes an open row from the list
  const closeRow = (rowMap: any, rowKey: number) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  // closes the delete swipe guester automatically
  const onRowOpen = async (rowKey: any, rowMap: any, toValue: number) => {
    if (rowMap[rowKey] && toValue == 75) {
      rowMap[rowKey].closeRow();
    }
  };

  // detect the swipe gesture so we can perform a swipe on delete functionality
  const onSwipeValueChange = (swipeData: any) => {
    const {key, value} = swipeData;
    if (value > 190 && !animationIsRunning) {
      setAnimationIsRunning(true);
      Alert.alert(
        'Delete',
        'Are you sure you want to delete this todo item ?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => DeleteItem(parseInt(key)),
          },
        ],
        {cancelable: true},
      );
    } else if (value < 75) {
      setAnimationIsRunning(false);
    }
    rowSwipeAnimatedValues[key].setValue(Math.abs(value));
  };

  // Render the UI of each item in a list view
  const renderItem = (data: any) => (
    <TouchableOpacity
      activeOpacity={0.99}
      onPress={() => {
        handleUpdate(data.item);
      }}
      style={styles.rowFront}>
      {data.item.compeleted && (
        <Image source={require('../../images/check.png')} style={styles.tick} />
      )}
      <Text numberOfLines={2} style={styles.flatListItemText}>
        {data.item.title}
      </Text>
    </TouchableOpacity>
  );

  // Render the UI of each item in a menu view
  const flatListItem = ({item}: any) => (
    <TouchableOpacity
      activeOpacity={0.99}
      onPress={() => {
        handleUpdate(item);
      }}
      style={styles.flatListItemContainer}>
      {item.compeleted && (
        <Image
          source={require('../../images/check.png')}
          style={styles.flatListItemImage}
        />
      )}
      <Text style={styles.flatListItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // render the quick actions view behind each row
  const renderHiddenItem = (data: any, rowMap: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.backLeftBtnleft]}
        onPress={() => closeRow(rowMap, data.item.key)}>
        <Animated.View
          style={[
            styles.trash,
            {
              transform: [
                {
                  scale: rowSwipeAnimatedValues[data.item.key].interpolate({
                    inputRange: [0, 75],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <Image
            source={require('../../images/trash.png')}
            style={styles.trash}
          />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => {
          closeRow(rowMap, data.item.key);
          handleUpdate(data.item);
        }}>
        <Animated.View
          style={[
            styles.trash,
            {
              transform: [
                {
                  scale: rowSwipeAnimatedValues[data.item.key].interpolate({
                    inputRange: [75, 175],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <Image
            source={require('../../images/edit.png')}
            style={styles.trash}
          />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          closeRow(rowMap, data.item.key);
          CompleteItem(data.item);
        }}>
        <Animated.View
          style={[
            styles.trash,
            {
              transform: [
                {
                  scale: rowSwipeAnimatedValues[data.item.key].interpolate({
                    inputRange: [15, 75, 150, 175],
                    outputRange: [0, 1, 1, 1.2],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <Image
            source={require('../../images/tick-white.png')}
            style={styles.trash}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );

  // the main screen UI
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#dcb200'}}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>My Todo List</Text>
          <TouchableOpacity
            style={styles.viewContainer}
            activeOpacity={0.6}
            onPress={() => setMenuView(!menuView)}>
            <Image
              source={
                menuView
                  ? require('../../images/menu.png')
                  : require('../../images/list.png')
              }
              style={styles.viewImage}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFab}
          style={styles.fapContainer}>
          <Image
            source={require('../../images/edit.png')}
            style={styles.trash}
          />
        </TouchableOpacity>
        {menuView ? (
          <FlatList
            contentContainerStyle={{padding: 5}}
            columnWrapperStyle={styles.flatListContainer}
            data={todos}
            numColumns={2}
            renderItem={flatListItem}
          />
        ) : (
          <SwipeListView
            contentContainerStyle={{paddingVertical: 15}}
            data={todos}
            renderItem={renderItem}
            onRowOpen={onRowOpen}
            closeOnRowBeginSwipe={true}
            renderHiddenItem={renderHiddenItem}
            leftOpenValue={75}
            stopRightSwipe={-200}
            stopLeftSwipe={200}
            rightOpenValue={-150}
            previewRowKey={'1'}
            previewOpenValue={-150}
            previewOpenDelay={1000}
            onSwipeValueChange={onSwipeValueChange}
          />
        )}
        <Modal
          isVisible={visible}
          key={'111'}
          animationIn="zoomInUp"
          animationInTiming={600}
          animationOut="zoomOutDown"
          animationOutTiming={500}
          onBackButtonPress={() => {
            handleDismiss();
          }}
          onBackdropPress={() => {
            handleDismiss();
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
              backgroundColor: 'white',
              flexDirection: 'column',
            }}>
            <View style={[styles.cardTitleContainer, {alignItems: 'center'}]}>
              <Text style={styles.cardTitle}>Todo Item</Text>
              <View style={styles.row}>
                <View style={styles.rowTitleContainer}>
                  <Text style={styles.rowTitleText}> Title </Text>
                </View>
                <View style={styles.cellLine}></View>
                <View style={styles.rowDataContainer}>
                  <TextInput
                    style={styles.rowDataText}
                    placeholder={'Title Goes here..'}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowTitleContainer}>
                  <Text style={styles.rowTitleText}>Compeleted</Text>
                </View>
                <View style={styles.cellLine}></View>
                <TouchableOpacity
                  onPress={() => setCompeleted(!compeleted)}
                  style={styles.rowDataContainer}>
                  <Image
                    source={
                      compeleted
                        ? require('../../images/check.png')
                        : require('../../images/un-check.png')
                    }
                    style={styles.checked}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{flexDirection: 'row-reverse'}}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 90,
                  height: 40,
                  borderRadius: 5,
                  backgroundColor: '#001D63',
                  margin: 10,
                }}
                onPress={() => {
                  if (title.trim() === '') {
                    {
                      Platform.OS === 'android' &&
                        ToastAndroid.show(
                          'Title cannot be empty',
                          ToastAndroid.LONG,
                        );
                    }
                  } else {
                    setVisible(false);
                    isUpdate ? UpdateItem() : AddItem();
                  }
                }}>
                <Text style={{color: 'white'}}>
                  {isUpdate ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
              {isUpdate && (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 90,
                    height: 40,
                    borderRadius: 5,
                    backgroundColor: 'red',
                    margin: 10,
                  }}
                  onPress={() => {
                    setVisible(false);
                    DeleteItem(idToupdate);
                  }}>
                  <Text style={{color: 'white'}}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
