#include "OrientationMath.h"

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {
  double magnitude = sqrt(acc[0]*acc[0] + acc[1]*acc[1] + acc[2]*acc[2]);
  acc[0] /= magnitude;
  acc[1] /= magnitude;
  acc[2] /= magnitude;

  int sgn = (acc[1] >= 0) ? 1 : -1; // Sign of acc[1]

  return -atan2(acc[2], sgn*sqrt(acc[0]*acc[0]+acc[1]*acc[1])) * 180 / M_PI; // Convert to degrees

}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  return -atan2(-acc[0], acc[1]) * 180 / M_PI; // Convert to degrees

}

/** TODO: see documentation in header file */
double computeFlatlandRollGyr(double flatlandRollGyrPrev, double gyr[3], double deltaT) {

  return flatlandRollGyrPrev + (gyr[2] * deltaT); // Convert to degrees

}

/** TODO: see documentation in header file */
double computeFlatlandRollAcc(double acc[3]) {

  return atan2(acc[0], acc[1]) * 180 / M_PI; // Convert to degrees

}

/** TODO: see documentation in header file */
double computeFlatlandRollComp(double flatlandRollCompPrev, double gyr[3], double flatlandRollAcc, double deltaT, double alpha) {

  double flatlandRollGyr = flatlandRollCompPrev + gyr[2] * deltaT; // Gyroscope contribution
  return alpha * flatlandRollGyr + (1 - alpha) * flatlandRollAcc;  // Weighted combination

}


/** TODO: see documentation in header file */
void updateQuaternionGyr(Quaternion& q, double gyr[3], double deltaT) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  if(gyr[0] == 0 && gyr[1] == 0 && gyr[2] == 0) {
    return; // No rotation
  }

  double Vangle = sqrt(gyr[0] * gyr[0] + gyr[1] * gyr[1] + gyr[2] * gyr[2]);
  double vx = gyr[0] / Vangle ;
  double vy = gyr[1] / Vangle;
  double vz = gyr[2] / Vangle;
  Quaternion qDelta = Quaternion().setFromAngleAxis(Vangle * deltaT, vx, vy, vz);
  q = Quaternion().multiply(q, qDelta);
  q.normalize(); // Normalize the quaternion to avoid drift

}


/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate


  double angle = sqrt(gyr[0] * gyr[0] + gyr[1] * gyr[1] + gyr[2] * gyr[2]) ; //rad
  if(angle <= 1e-8) {
    return; // No rotation
  }
  //get all gyro sensors and calculate roatation qdelta
  double vx = gyr[0] / angle;
  double vy = gyr[1] / angle;
  double vz = gyr[2] / angle;
  Quaternion qDelta = Quaternion().setFromAngleAxis(angle * deltaT, vx, vy, vz);

  //update filter via multiplication with previous quaternion
  Quaternion qw = Quaternion().multiply(q, qDelta);
  qw.normalize(); // Normalize the quaternion to avoid drift

  // Compute the quaternion from accelerometer data
  double ax = acc[0];
  double ay = acc[1];
  double az = acc[2];
  // double norm = sqrt(ax * ax + ay * ay + az * az);
  // ax /= norm;
  // ay /= norm;
  // az /= norm;
  Quaternion qAcc(0, ax, ay, az);

  //rotate and normalize the quaternion
  Quaternion qaworld = qAcc.rotate(qw);
  qaworld.normalize(); // Normalize the quaternion to avoid drift

  //find phi using the dot product
  double avx = qaworld.q[1]; // x component
  double avy = qaworld.q[2]; // y component  
  double avz = qaworld.q[3]; // z component
  double alength = sqrt(avx * avx + avy * avy + avz * avz);
  avx /= alength; // Normalize x component
  avy /= alength; // Normalize y component
  avz /= alength; // Normalize z component
  double phi = acos(avy) * 180 / M_PI; // Angle in degrees

  //find normalized vector
  double nx = -avz; // Normalized x component
  double nz = avx; // Normalized y component
  double nmag = sqrt(nx * nx + nz * nz); // Magnitude of v //this should be 1 lol
  nx /= nmag; // Normalize x component
  nz /= nmag; // Normalize z component

  Quaternion qAccComp = Quaternion().setFromAngleAxis((1-alpha)*phi, nx, 0, nz);
  q = Quaternion().multiply(qAccComp, qw);
  q.normalize(); // Normalize the quaternion to avoid drift
  //q=qaworld; // Normalize the quaternion to avoid drift
}
