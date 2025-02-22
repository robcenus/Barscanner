import {
  CameraType,
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [barcodeData, setBarcodeData] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    const photo = await ref.current.takePictureAsync();
    setUri(photo.uri);
    setScanned(true);
    setBarcodeData(data);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://192.168.0.101:8000/scan/${barcodeData}`);
      if (response.status === 404) {
        setErrorMessage("Cable not found");
        return;
      }
      const result = await response.json();
      setSearchResult(result);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const renderSearchResult = () => {
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultTextContainer}>
          <Text selectable style={styles.resultText}>Code: {searchResult?.barcode}</Text>
          <Text selectable style={styles.resultText}>Name: {searchResult?.name}</Text>
          <Text selectable style={styles.resultText}>Length: {searchResult?.length}</Text>
          <Text selectable style={styles.resultText}>Type: {searchResult?.type}</Text>
          <Text selectable style={styles.resultText}>Origin: {searchResult?.origin}</Text>
          <Text selectable style={styles.resultText}>Target: {searchResult?.target}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            color="#5e81ac"
            onPress={() => {
              setUri(null);
              setBarcodeData(null);
              setScanned(false);
              setSearchResult(null);
              setShowResults(false);
              setErrorMessage(null);
            }}
            title="Scan another barcode"
          />
        </View>
      </View>
    );
  };

  const renderPicture = () => {
    return (
      <View style={styles.container}>
        <Image source={{ uri }} contentFit="contain" style={{ width: 300, aspectRatio: 1 }} />
        <Text selectable style={{ textAlign: "center", marginVertical: 10, color: "#eceff4" }}>
          {barcodeData}
        </Text>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        <View style={styles.buttonRow}>
          <Button color="#bf616a" onPress={() => {
            setUri(null);
            setBarcodeData(null);
            setScanned(false);
            setErrorMessage(null);
          }} title="Scan Again" />
          <Button color="#5e81ac" onPress={handleSearch} title="Search" />
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <AntDesign name="close" size={30} color="#eceff4" style={styles.closeIcon} onPress={() => setShowCamera(false)} />
        <CameraView
          style={styles.camera}
          ref={ref}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      </View>
    );
  };

  const renderInitialView = () => {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showResults ? renderSearchResult() : uri ? renderPicture() : showCamera ? renderCamera() : renderInitialView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2e3440",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    backgroundColor: "#5e81ac",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    marginTop: "15%",
    alignItems: "flex-start",
  },
  resultTextContainer: {
    alignSelf: "flex-start",
  },
  resultText: {
    color: "#eceff4",
    fontSize: 18,
    marginVertical: 5,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 10,
  },
  errorText: {
    color: "#bf616a",
    textAlign: "center",
    marginVertical: 5,
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
  },
  closeIcon: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
});
