#include "OrientationTracker.h"

OrientationTracker::OrientationTracker(double imuFilterAlphaIn,  bool simulateImuIn) :

  imu(),
  gyr{0,0,0},
  acc{0,0,0},
  gyrBias{0,0,0},
  gyrVariance{0,0,0},
  accBias{0,0,0},
  accVariance{0,0,0},
  previousTimeImu(0),
  imuFilterAlpha(imuFilterAlphaIn),
  deltaT(0.0),
  simulateImu(simulateImuIn),
  simulateImuCounter(0),
  flatlandRollGyr(0),
  flatlandRollAcc(0),
  flatlandRollComp(0),
  quaternionGyr{1,0,0,0},
  eulerAcc{0,0,0},
  quaternionComp{1,0,0,0}

  {

}

void OrientationTracker::initImu() {
  imu.init();
}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::measureImuBiasVariance()
{

  // check if imu.read() returns true
  // then read imu.gyrX, imu.accX, ...

  // compute bias, variance.
  // update:
  // gyrBias[0], gyrBias[1], gyrBias[2]
  // gyrVariance[0], gyrBias[1], gyrBias[2]
  // accBias[0], accBias[1], accBias[2]
  // accVariance[0], accBias[1], accBias[2]

  const int sampleCount = 1000;
  double gyrSamples[3][sampleCount] = {0};
  double accSamples[3][sampleCount] = {0};

  int collectedSamples = 0;

  while (collectedSamples < sampleCount)
  {
    if (imu.read())
    {
      // Store the current gyroscope and accelerometer values
      gyrSamples[0][collectedSamples] = imu.gyrX;
      gyrSamples[1][collectedSamples] = imu.gyrY;
      gyrSamples[2][collectedSamples] = imu.gyrZ;

      accSamples[0][collectedSamples] = imu.accX;
      accSamples[1][collectedSamples] = imu.accY;
      accSamples[2][collectedSamples] = imu.accZ;

      collectedSamples++;
    }
    // Compute bias and variance for gyroscope and accelerometer
    for (int i = 0; i < 3; i++)
    {
      double gyrSum = 0, accSum = 0;
      double gyrSquaredSum = 0, accSquaredSum = 0;

      for (int j = 0; j < sampleCount; j++)
      {
        gyrSum += gyrSamples[i][j];
        accSum += accSamples[i][j];

        gyrSquaredSum += gyrSamples[i][j] * gyrSamples[i][j];
        accSquaredSum += accSamples[i][j] * accSamples[i][j];
      }

      // Calculate bias (mean)
      gyrBias[i] = gyrSum / sampleCount;
      accBias[i] = accSum / sampleCount;

      // Calculate variance
      gyrVariance[i] = (gyrSquaredSum / sampleCount) - (gyrBias[i] * gyrBias[i]);
      accVariance[i] = (accSquaredSum / sampleCount) - (accBias[i] * accBias[i]);
    }
  }
//bias values
//   GYR_BIAS: 0.23206 -0.22437 0.12708
// GYR_VAR: 0.04051 0.03852 0.04320
// ACC_BIAS: 1.366 0.764 7.896
// ACC_VAR: 0.001 0.002 0.002
}
  void OrientationTracker::setImuBias(double bias[3])
  {

    for (int i = 0; i < 3; i++)
    {
      gyrBias[i] = bias[i];
    }
  }

  void OrientationTracker::resetOrientation()
  {

    flatlandRollGyr = 0;
    flatlandRollAcc = 0;
    flatlandRollComp = 0;
    quaternionGyr = Quaternion();
    eulerAcc[0] = 0;
    eulerAcc[1] = 0;
    eulerAcc[2] = 0;
    quaternionComp = Quaternion();
  }

  bool OrientationTracker::processImu()
  {

    if (simulateImu)
    {

      // get imu values from simulation
      updateImuVariablesFromSimulation();
    } else {

    //get imu values from actual sensor
    if (!updateImuVariables()) {

      //imu data not available
      return false;

    }

  }

  //run orientation tracking algorithms
  updateOrientation();

  return true;

}

void OrientationTracker::updateImuVariablesFromSimulation() {

    deltaT = 0.002;
    //get simulated imu values from external file
    for (int i = 0; i < 3; i++) {
      gyr[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    for (int i = 0; i < 3; i++) {
      acc[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    simulateImuCounter = simulateImuCounter % nImuSamples;

    //simulate delay
    delay(1);

}

/**
 * TODO: see documentation in header file
 */
bool OrientationTracker::updateImuVariables() {

  //sample imu values
  if (!imu.read()) {
  // return false if there's no data
    return false;
  }

  //call micros() to get current time in microseconds
  //update:
  //previousTimeImu (in seconds)
  //deltaT (in seconds)
      // Call micros() to get the current time in microseconds
      double currentTimeMicros = (double)micros() / 1e6;

      // Update deltaT (in seconds)
      deltaT = (currentTimeMicros - previousTimeImu);
  
      // Update previousTimeImu (convert to seconds for consistency)
      previousTimeImu = currentTimeMicros;

  //read imu.gyrX, imu.accX ...
  //update:
  //gyr[0], ...
  //acc[0], ...

  // You also need to appropriately modify the update of gyr as instructed in (2.1.3).
  gyr[0] = (imu.gyrX - gyrBias[0]);
  gyr[1] = (imu.gyrY - gyrBias[1]);
  gyr[2] = (imu.gyrZ - gyrBias[2]);
  acc[0] = (imu.accX );
  acc[1] = (imu.accY );
  acc[2] = (imu.accZ );

  return true;

}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::updateOrientation() {

  //call functions in OrientationMath.cpp.
  //use only class variables as arguments to functions.

  //update:
  flatlandRollGyr = computeFlatlandRollGyr(flatlandRollGyr, gyr, deltaT);
  flatlandRollAcc = computeFlatlandRollAcc(acc);
  flatlandRollComp = computeFlatlandRollComp(flatlandRollComp, gyr, flatlandRollAcc, deltaT, imuFilterAlpha);
  updateQuaternionGyr(quaternionGyr, gyr, deltaT);

  eulerAcc[0] = computeAccPitch(acc);
  eulerAcc[1] = 0;
  eulerAcc[2] = computeAccRoll(acc);
  updateQuaternionComp(quaternionComp, gyr, acc, deltaT, 0);

  //quaternionComp




}
