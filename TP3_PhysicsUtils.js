const isArray = Array.isArray || function(value) {
  return {}.toString.call(value) !== "[object Array]"
};

export default {
	
	/*
	Changes position using velocity and time delta
	Use .clone() to prevent modifying vectors when doing operations!
	------------------------
	p is a Three.js Vector2 or Vector3 (position of the object)
	v is a Three.js Vector2 or Vector3 (velocity of the object)
	delta is a float (time delta)
	Note: Vectors are always of same size, eg. if p is a Vector2, v will be a Vector2.
	*/
	applyMovement(p, v, delta) {
		p.add(v.clone().multiplyScalar(delta));
	},
	
	/*
	Changes the sphere's rotation using position delta
	Careful, dp is always an 3D vector with y=0 (no movement along the y axis)!
	Use .clone() to prevent modifying vectors when doing operations!
	You can use for example, dp.clone().set(1, 2, 3) to create a new vector with components (1, 2, 3), if necessary
	------------------------
	dp is a Three.js Vector3 (position delta)
	sphereRadius is a float (radius of the sphere)
	sphereObj is a Three.js Object3D (object representation of a sphere)
	*/
	applyRotation(dp, sphereRadius, sphereObj) {
		let circonference = Math.PI * sphereRadius;
		let x = dp.x;
		let z = dp.z;
		let angleX = (x / circonference) % (2 * Math.PI);
		let angleZ = (z / circonference) % (2 * Math.PI);
		if (x === 0.0 && z !== 0.0) {
			sphereObj.rotateOnWorldAxis(dp.clone().set(1.0, 0.0, 0.0), angleZ);
		} else if (z === 0.0 && x !== 0.0) {
			sphereObj.rotateOnWorldAxis(dp.clone().set(0.0, 0.0, 1.0), angleX);
		} else if (x !== 0.0 && z !== 0.0) {
			sphereObj.rotateOnWorldAxis(dp.clone().set(1.0, 0.0, 0.0), angleZ);
			sphereObj.rotateOnWorldAxis(dp.clone().set(0.0, 0.0, 1.0), - angleX);
		}
	},

	/*
	Checks if two circles/spheres have collided
	Returns true if collision has occured, false otherwise
	------------------------
	circlePos0 is a Three.js Vector2 or Vector3 (position of first object)
	circlePos1 is a Three.js Vector2 or Vector3 (position of second object)
	circleRadius is a float (radius of the object)
	Note: Vectors are always of same size, eg. if circlePos0 is a Vector2, every other Vector parameter will be a Vector2.
	*/
	checkCollisionCircleCircle(circlePos0, circlePos1, circleRadius) {
		let d = (circlePos0.x - circlePos1.x) * (circlePos0.x - circlePos1.x)
			+ (circlePos0.y - circlePos1.y) * (circlePos0.y - circlePos1.y);
		return d <= Math.pow((2 * circleRadius), 2);
	},

	/*
	Checks if a circle/sphere has collided with the outer part of a line segment
	Returns true if collision has occured, false otherwise
	------------------------
	circlePos is a Three.js Vector2 or Vector3 (position of the object)
	circleRadius is a float (radius of the object)
	linePos0 is a Three.js Vector2 or Vector3 (start point of the segment)
	linePos1 is a Three.js Vector2 or Vector3 (end point of the segment)
	Note: Vectors are always of same size, eg. if circlePos is a Vector2, every other Vector parameter will be a Vector2.
	*/
	checkCollisionCircleSegmentOuter(circlePos, circleRadius, linePos0, linePos1) {
		let distX0 = linePos0.x - circlePos.x;
		let distX1 = linePos1.x - circlePos.x;
		let distY0 = linePos0.y - circlePos.y;
		let distY1 = linePos1.y - circlePos.y;
		let distance0 = Math.sqrt(distX0 * distX0 + distY0 * distY0);
		let distance1 = Math.sqrt(distX1 * distX1 + distY1 * distY1);

		return distance0 <= circleRadius || distance1 <= circleRadius;
	},
	
	/*
	Checks if a circle/sphere has collided with the inner part of a line segment
	Returns true if collision has occured, false otherwise
	------------------------
	circlePos is a Three.js Vector2 or Vector3 (position of the object)
	circleRadius is a float (radius of the object)
	linePos0 is a Three.js Vector2 or Vector3 (start point of the segment)
	linePos1 is a Three.js Vector2 or Vector3 (end point of the segment)
	Note: Vectors are always of same size, eg. if circlePos is a Vector2, every other Vector parameter will be a Vector2.
	*/
	checkCollisionCircleSegmentInner(circlePos, circleRadius, linePos0, linePos1) {
		let distX = linePos0.x - linePos1.x;
		let distY = linePos0.y - linePos1.y;
		let long = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

		// Dot product entre la ligne et le cercle (un point de la ligne et le centre du cercle)
		let prodX = (circlePos.x - linePos0.x) * (linePos1.x - linePos0.x);
		let prodY = (circlePos.y - linePos0.y) * (linePos1.y - linePos0.y);
		let dot = (prodX + prodY) / Math.pow(long, 2);

		let xClose = linePos0.x + (dot * (linePos1.x - linePos0.x));
		let yClose = linePos0.y + (dot * (linePos1.y - linePos0.y));

		let distancePos0 = Math.sqrt(Math.pow(linePos0.x - xClose, 2) + Math.pow(linePos0.y - yClose, 2));
		let distancePos1 = Math.sqrt(Math.pow(linePos1.x - xClose, 2) + Math.pow(linePos1.y - yClose, 2));
		if (!(distancePos0 + distancePos1 >= long && distancePos0 + distancePos1 <= long)) {
			return false
		}

		distX = xClose - circlePos.x;
		distY = yClose - circlePos.y;
		long = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

		return long <= circleRadius;
	},
	
	//Applies linear and quadratic friction on velocity using time delta
	applyFriction(p, v, delta, qfric, lfric) {
		let speed = v.length();
		let newspeed = speed - (speed * qfric + lfric) * delta;
		if (newspeed < 0) {
			newspeed = 0;
		}
		v.setLength(newspeed);
	},

	checkCircleInHole(circlePos, holePos, holeRadius) {
		//If out of bounds
		if (circlePos.x < -98.5 || circlePos.x > 99.5 || circlePos.y < -53 || circlePos.y > 53) {
			return true;
		}
		
		//If in hole
		let distSq = circlePos.distanceToSquared(holePos);
		return distSq <= (holeRadius * holeRadius);
	},
	
	resolvePositionCollisionCircleCircle(p0, p1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if p0 and p1 are at same position
		if (p0.distanceToSquared(p1) == 0) {
			p0.x += (Math.random() - 0.5) * epsilon;
			p0.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let midpoint = p0.clone().add(p1).divideScalar(2);
		
		let newp0 = p0.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		let newp1 = p1.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		p0.copy(newp0);
		p1.copy(newp1);
	},

	resolveVelocityCollisionCircleCircle(p0, v0, p1, v1, circleRadius, cor) {
		const epsilon = 0.0001;
		
		//Resolve if p0 and p1 are at same position
		if (p0.distanceToSquared(p1) == 0) {
			p0.x += (Math.random() - 0.5) * epsilon;
			p0.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve velocity using conservation of momentum
		let diffp01 = p0.clone().sub(p1);
		let diffp10 = p1.clone().sub(p0);
		let diffv01 = v0.clone().sub(v1);
		let diffv10 = v1.clone().sub(v0);
		
		//Perfect elastic collision
		let ev0 = v0.clone().sub(diffp01.clone().multiplyScalar(diffv01.dot(diffp01)/diffp01.lengthSq()));
		let ev1 = v1.clone().sub(diffp10.clone().multiplyScalar(diffv10.dot(diffp10)/diffp10.lengthSq()));
		
		//Inelastic collision
		let avgv = ev0.clone().add(ev1).divideScalar(2);
		
		//Approximate collision with CoR
		let newv0 = ev0.clone().multiplyScalar(cor).add(avgv.clone().multiplyScalar(1 - cor));
		let newv1 = ev1.clone().multiplyScalar(cor).add(avgv.clone().multiplyScalar(1 - cor));
		
		v0.copy(newv0);
		v1.copy(newv1);
	},

	resolveVelocityCollisionCircleSegmentOuter(p, v, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		let d0 = p.clone().sub(ps0);
		let d1 = p.clone().sub(ps1);
		
		let midpoint;
		if (d0.lengthSq() < d1.lengthSq()) {
			midpoint = ps0;
		} else {
			midpoint = ps1;
		}
		
		//Solve velocity using reflection equation
		let normal = p.clone().sub(midpoint).normalize();
		let newv = v.clone().sub(normal.clone().multiplyScalar(2*v.dot(normal)));
		v.copy(newv);
	},

	resolvePositionCollisionCircleSegmentOuter(p, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let d0 = p.clone().sub(ps0);
		let d1 = p.clone().sub(ps1);
		
		let midpoint;
		if (d0.lengthSq() < d1.lengthSq()) {
			midpoint = ps0;
		} else {
			midpoint = ps1;
		}
		
		let newp = p.clone().sub(midpoint).setLength(circleRadius + epsilon).add(midpoint);
		p.copy(newp);
	},

	resolveVelocityCollisionCircleSegmentInner(p, v, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		let a = p.clone().sub(ps0);
		let b = ps1.clone().sub(ps0);
		let aprojb = b.clone().multiplyScalar(a.dot(b)/b.dot(b));
		
		//Solve velocity using reflection equation
		let normal = a.clone().sub(aprojb);
		if (normal.lengthSq() == 0) {
			normal.x += (Math.random() - 0.5) * epsilon;
			normal.y += (Math.random() - 0.5) * epsilon;
		}
		normal.normalize();
		
		let newv = v.clone().sub(normal.setLength(2*v.dot(normal)));
		v.copy(newv);
	},

	resolvePositionCollisionCircleSegmentInner(p, ps0, ps1, circleRadius) {
		const epsilon = 0.0001;
		
		//Resolve if two objects are exactly at same position
		if (p.distanceToSquared(ps0) == 0 || p.distanceToSquared(ps1) == 0) {
			p.x += (Math.random() - 0.5) * epsilon;
			p.y += (Math.random() - 0.5) * epsilon;
		}
		
		//Solve position
		let a = p.clone().sub(ps0);
		let b = ps1.clone().sub(ps0);
		let aprojb = b.clone().multiplyScalar(a.dot(b)/b.dot(b));
		
		let normal = a.clone().sub(aprojb);
		if (normal.lengthSq() == 0) {
			normal.x += (Math.random() - 0.5) * epsilon;
			normal.y += (Math.random() - 0.5) * epsilon;
		}
		
		let newp = normal.setLength(circleRadius + epsilon).add(aprojb).add(ps0);
		p.copy(newp);
	},

	//Shuffle from https://stackoverflow.com/questions/18194745/shuffle-multiple-javascript-arrays-in-the-same-way
	shuffle() {
	  var arrLength = 0;
	  var argsLength = arguments.length;
	  var rnd, tmp;

	  for (var index = 0; index < argsLength; index += 1) {
		if (!isArray(arguments[index])) {
		  throw new TypeError("Argument is not an array.");
		}

		if (index === 0) {
		  arrLength = arguments[0].length;
		}

		if (arrLength !== arguments[index].length) {
		  throw new RangeError("Array lengths do not match.");
		}
	  }

	  while (arrLength) {
		rnd = Math.floor(Math.random() * arrLength);
		arrLength -= 1;
		for (let argsIndex = 0; argsIndex < argsLength; argsIndex += 1) {
		  tmp = arguments[argsIndex][arrLength];
		  arguments[argsIndex][arrLength] = arguments[argsIndex][rnd];
		  arguments[argsIndex][rnd] = tmp;
		}
	  }
	}
}