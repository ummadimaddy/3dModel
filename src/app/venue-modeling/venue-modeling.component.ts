import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three-full';
import { GeometryService } from './../geometry.service';

@Component({
  selector: 'app-venue-modeling',
  templateUrl: './venue-modeling.component.html',
  styleUrls: ['./venue-modeling.component.css'],
})
export class VenueModelingComponent {
  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  private scene: any;
  private camera: any;
  private renderer: any;
  private objectShapes: any[] = [];
  private grid: any;
  public orbitControls: any;
  public dragControls: any;
  private draggableObjectsArray: any[] = [];
  public previousColor: any;
  public geometryShapes: any[];
  public editableObject: any = '';
  /*FormGroup*/
  public cubeDimensionForm: FormGroup;
  public sphereDimensionForm: FormGroup;
  public helperGridDimensionForm: FormGroup;
  public trapezoidDimensionForm: FormGroup;
  public selectedShape: any = '';
  /*Boolean items*/
  public isHelperSelected: boolean = false;
  public isCubeSelected: boolean = false;
  public isTrapezoidSelected: boolean = false;
  public isSphereSelected: boolean = false;
  public isEditSphereObject: boolean = false;
  public isEditCubeObject: boolean = false;
  public isEditTrapezoidObject: boolean = false;
  public isEditHelperObject: boolean = false;

  spherePosition: any;
  trapezoidPosition: any;
  geometryType: any[] = [];
  object1: string = '';
  object2: string = '';
  distance: any;
  position1: any;
  position2: any;
  templateGroups: any[] = [];
  flightData: any = '';

  public constructor(private geometryService: GeometryService) {
    //scene
    this.scene = new THREE.Scene();
    //Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 0, 10);
    //Render
    this.renderer = new THREE.WebGLRenderer();
    //List of geometry Shapes
    this.geometryShapes = ['HelperGrid', 'Cube', 'Sphere', 'Trapezoid'];
    /*---------------------From Groups(FG)----------------------------*/
    //Grid FG
    this.helperGridDimensionForm = new FormGroup({
      size: new FormControl('', Validators.required),
      divisions: new FormControl('', Validators.required),
    });
    //Cube FG
    this.cubeDimensionForm = new FormGroup({
      width: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      depth: new FormControl('', Validators.required),
    });
    //Sphere FG
    this.sphereDimensionForm = new FormGroup({
      radius: new FormControl('', Validators.required),
      widthSegments: new FormControl('', Validators.required),
      heightSegments: new FormControl('', Validators.required),
    });
    //Trapezoid FG
    this.trapezoidDimensionForm = new FormGroup({
      radiusTop: new FormControl('', Validators.required),
      radiusBottom: new FormControl('', Validators.required),
      height: new FormControl('', Validators.required),
      radialSegments: new FormControl('', Validators.required),
      heightSegments: new FormControl('', Validators.required),
    });
  }

  public ngAfterViewInit(): void {
    this.renderer.setSize(900, 400);
    this.renderer.setClearColor(0x000000);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.dragControls = new THREE.DragControls(this.draggableObjectsArray, this.camera, this.renderer.domElement);
    this.dragControls.addEventListener('dragstart', (event: any) => {
      this.orbitControls.enabled = false;
    }, true);
    this.dragControls.addEventListener('dragend', (event: any) => {
      this.orbitControls.enabled = true;
      if (event.object.name.startsWith('cube')) {
        this.cubeDimensionForm
          .get('width')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.width,
          );

        this.cubeDimensionForm
          .get('height')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.height,
          );

        this.cubeDimensionForm
          .get('depth')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.depth,
          );

        this.editableObject = this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)];

        this.isCubeSelected = true;
        this.isTrapezoidSelected = false;
        this.isSphereSelected = false;
        this.isHelperSelected = false;

        this.isEditCubeObject = true;
      } else if (event.object.name.startsWith('helper')) {
        this.helperGridDimensionForm
          .get('size')
          .setValue(this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].parameters.size);

        this.helperGridDimensionForm
          .get('divisions')
          .setValue(this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].parameters.divisions);

        this.editableObject = this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)];

        this.isCubeSelected = false;
        this.isTrapezoidSelected = false;
        this.isSphereSelected = false;
        this.isHelperSelected = true;

        this.isEditHelperObject = true;
      } else if (event.object.name.startsWith('trapezoid')) {
        this.trapezoidDimensionForm
          .get('radiusTop')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.radiusTop,
          );

        this.trapezoidDimensionForm
          .get('radiusBottom')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters
              .radiusBottom,
          );

        this.trapezoidDimensionForm
          .get('height')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.height,
          );

        this.trapezoidDimensionForm
          .get('radialSegments')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters
              .radialSegments,
          );

        this.trapezoidDimensionForm
          .get('heightSegments')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters
              .heightSegments,
          );

        this.editableObject = this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)];

        this.isCubeSelected = false;
        this.isTrapezoidSelected = true;
        this.isSphereSelected = false;
        this.isHelperSelected = false;

        this.isEditTrapezoidObject = true;
      } else if (event.object.name.startsWith('sphere')) {
        this.sphereDimensionForm
          .get('radius')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters.radius,
          );

        this.sphereDimensionForm
          .get('widthSegments')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters
              .widthSegments,
          );

        this.sphereDimensionForm
          .get('heightSegments')
          .setValue(
            this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)].geometry.parameters
              .heightSegments,
          );

        this.editableObject = this.draggableObjectsArray[this.draggableObjectsArray.indexOf(event.object)];

        this.isCubeSelected = false;
        this.isTrapezoidSelected = false;
        this.isSphereSelected = true;
        this.isHelperSelected = false;

        this.isEditSphereObject = true;
      }
    }, true);
    const page = document.getElementById('main-canvas');
    const menu = document.getElementById('menu');

    page.addEventListener('contextmenu', function (e: any) {
      e.preventDefault();
      menu.style.display = 'block';
      menu.style.position = 'absolute';
      menu.style.top = e.clientY + 'px';
      menu.style.left = e.clientX + 'px';
    });

    page.addEventListener('click', function (e) {
      e.preventDefault();
      menu.style.display = 'none';
    });

    this.animate();
  }

  public editObject(): void {
    if (this.editableObject.name.startsWith('cube')) {
      let new_geometry = new THREE.BoxGeometry(
        this.cubeDimensionForm.get('width').value,
        this.cubeDimensionForm.get('height').value,
        this.cubeDimensionForm.get('depth').value,
        5,
        5,
        5,
        5,
      );
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry.dispose();
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry = new_geometry;
    } else if (this.editableObject.name.startsWith('sphere')) {
      let sphereTempGeometry = new THREE.SphereGeometry(
        this.sphereDimensionForm.get('radius').value,
        this.sphereDimensionForm.get('widthSegments').value,
        this.sphereDimensionForm.get('heightSegments').value,
      );
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry.dispose();
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry = sphereTempGeometry;
    } else if (this.editableObject.name.startsWith('trapezoid')) {
      // radiusTop, radiusBottom, height, radialSegments, heightSegments
      let trapezoidTempGeometry = new THREE.CylinderGeometry(
        this.trapezoidDimensionForm.get('radiusTop').value,
        this.trapezoidDimensionForm.get('radiusBottom').value,
        this.trapezoidDimensionForm.get('height').value,
        this.trapezoidDimensionForm.get('radialSegments').value,
        this.trapezoidDimensionForm.get('heightSegments').value,
      );
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry.dispose();
      this.draggableObjectsArray[
        this.draggableObjectsArray.indexOf(this.editableObject)
      ].geometry = trapezoidTempGeometry;
    } else if (this.editableObject.name.startsWith('helper')) {
      let size = this.helperGridDimensionForm.get('size').value || 10;
      let divisions = this.helperGridDimensionForm.get('divisions').value || 10;
      let color1 = new THREE.Color(0x444444);
      let color2 = new THREE.Color(0x888888);

      var center = divisions / 2;
      var step = size / divisions;
      var halfSize = size / 2;

      var vertices = [],
        colors = [];

      for (var i = 0, j = 0, k = -halfSize; i <= divisions; i++ , k += step) {
        vertices.push(-halfSize, 0, k, halfSize, 0, k);
        vertices.push(k, 0, -halfSize, k, 0, halfSize);

        var color = i === center ? color1 : color2;

        color.toArray(colors, j);
        j += 3;
        color.toArray(colors, j);
        j += 3;
        color.toArray(colors, j);
        j += 3;
        color.toArray(colors, j);
        j += 3;
      }

      var geometry = new THREE.BufferGeometry();
      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].parameters = {
        size: this.helperGridDimensionForm.get('size').value,
        divisions: this.helperGridDimensionForm.get('divisions').value,
      };

      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry.dispose();
      this.draggableObjectsArray[this.draggableObjectsArray.indexOf(this.editableObject)].geometry = geometry;
    }
  }

  /**
   *
   * On changing dropdown options while selecting 3D object.
   *
   * @param event.
   *
   */
  public onDropdownChanged(event: any): void {
    this.helperGridDimensionForm.reset();
    this.cubeDimensionForm.reset();
    this.trapezoidDimensionForm.reset();
    this.sphereDimensionForm.reset();
    this.isEditCubeObject = false;
    this.isEditTrapezoidObject = false;
    this.isEditSphereObject = false;
    this.isEditHelperObject = false;
    this.selectedShape = event;

    if (event === 'HelperGrid') {
      this.isHelperSelected = true;
      this.isCubeSelected = false;
      this.isTrapezoidSelected = false;
      this.isSphereSelected = false;
    } else if (event === 'Cube') {
      this.isHelperSelected = false;
      this.isCubeSelected = true;
      this.isTrapezoidSelected = false;
      this.isSphereSelected = false;
    } else if (event === 'Trapezoid') {
      this.isHelperSelected = false;
      this.isCubeSelected = false;
      this.isTrapezoidSelected = true;
      this.isSphereSelected = false;
    } else if (event === 'Sphere') {
      this.isHelperSelected = false;
      this.isCubeSelected = false;
      this.isTrapezoidSelected = false;
      this.isSphereSelected = true;
    }
  }

  /**
   *
   * Creates helper grid.
   *
   * @param size
   * @param divisions
   *
   */
  public createHelperGrid(size: any, divisions: any): void {
    this.grid = new THREE.GridHelper(size, divisions);
    this.grid.name = 'helper' + '-' + Math.random();
    this.scene.add(this.grid);
    this.grid.parameters = { size: size, divisions: divisions };
    this.draggableObjectsArray.push(this.grid);

  }

  /**
   *
   * Rotates object.
   *
   * @param object
   *
   */
  public rotateObject(object: any): void {
    // To be implemented.
  }

  /**
   *
   * Creates cube 3D object.
   *
   */
  public createCube(width: any, height: any, depth: any): void {
    this.dragControls.activate();
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth, 5, 5, 5),
      new THREE.MeshBasicMaterial({
        color: 'skyblue',
        wireframe: true,
      }),
    );

    cube.name = 'cube' + '-' + Math.random();

    cube.rotation.x = Math.PI / 2;

    cube.position.set(1, 1, 0);

    this.scene.add(cube);

    this.draggableObjectsArray.push(cube);
    this.draggableObjDD(cube);
  }

  /**
   *
   * Creates trapezoid.
   *
   */
  public createTrapezoid(
    radiusTop: any,
    radiusBottom: any,
    height: any,
    radialSegments: any,
    heightSegments: any,
  ): void {
    const trapezoid = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments),
      new THREE.MeshBasicMaterial({
        color: 'green',
        wireframe: true,
      }),
    );
    trapezoid.name = 'trapezoid' + '-' + Math.random();
    trapezoid.position.set(2, 2, 0);
    this.scene.add(trapezoid);
    this.draggableObjectsArray.push(trapezoid);
    this.draggableObjDD(trapezoid);
  }

  /**
   *
   * Creates sphere.
   *
   * @param radius
   * @param widthSegments
   * @param heightSegments
   *
   */
  public createSphere(radius: any, widthSegments: any, heightSegments: any): void {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, widthSegments, heightSegments),
      new THREE.MeshBasicMaterial({
        color: 'skyblue',
        wireframe: true,
      }),
    );
    sphere.name = 'sphere' + '-' + Math.random();
    sphere.position.set(-1, 1, 0);
    this.scene.add(sphere);
    this.draggableObjectsArray.push(sphere);
    this.draggableObjDD(sphere);
  }

  /**
   *
   * Animates the scene.
   *
   */
  public animate(): void {
    // Requests animation frame every few seconds and updates the scene in the background.
    window.requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  public getFormattedObjectName(name: any): string {
    return name.slice(0, name.indexOf('-')) + Number(name.slice(name.indexOf('-'))).toFixed(2);
  }

  draggableObjDD(shape) {
    this.geometryType.push(shape.geometry.type);
  }

  getDistance() {
    this.distance = this.position1.distanceTo(this.position2).toFixed(2);
  }

  selectedShape1(selectedShape) {
    this.object1 = selectedShape;
    this.draggableObjectsArray.forEach((geometry) => {
      if (geometry.geometry.type === selectedShape) {
        this.position1 = geometry.position;
      }
    });
  }

  createGroup() {

    this.dragControls.deactivate();

    const group = new THREE.Group();

    this.draggableObjectsArray.forEach((obj1: any) => {
      group.add(obj1);
    });

    this.scene.add(group);
    group.name = "Template - " + Math.random().toFixed(2);

    // const tempGroup: any = JSON.parse(JSON.stringify(group));

    this.geometryService.groups.push(group);

    this.templateGroups = this.geometryService.groups;

    this.deleteGroup(group.name);

  }

  onTemplateChanged(template: any): void {
    template.children = this.geometryService.groupChildrenMap[template.name];
    this.scene.add(template);
    this.dragControls.activate();
  }

  selectedShape2(selectedShape) {
    this.object2 = selectedShape;
    this.draggableObjectsArray.forEach((geometry) => {
      if (geometry.geometry.type === selectedShape) {
        this.position2 = geometry.position;
      }
    });
  }

  deleteGroup(groupName: any): void {
    const childrenObjectsToRemove: any[] = [];
    this.scene.children.forEach((child) => {
      // const refArray = child.children;
      // const clonedArray = [...refArray];
      const tempArray: any[] = [];
      child.children.forEach((childObj: any) => {
        const clonedObj = childObj.clone();
        tempArray.push(clonedObj);
      });
      // JSON.parse(JSON.stringify(child.children));
      this.geometryService.groupChildrenMap[groupName] = tempArray;
    });
    this.scene.traverse((child: any) => {
      childrenObjectsToRemove.push(child);
    });
    childrenObjectsToRemove.forEach((child: any) => {
      this.scene.remove(child);
    });
    // this.draggableObjectsArray = [];
  }

  print() {
    window.print();
  }

  generateHeatMap() {
    let heatmapInstance = h337.create({
      container: document.querySelector('.heatmap'),
      defaultRenderer: 'canvas3d'
    });
    document.querySelector('.heatmap').onmousemove = function (ev) {
      heatmapInstance.addData({
        x: ev.layerX,
        y: ev.layerY,
        value: 1
      });
      console.log('data', heatmapInstance._config);
    };
  }
}
