// Local, editable training profile. Keep this as plain data so it also works
// when the site is opened directly with a file:// URL.
window.CockpitProfiles = {
  profile: {
    aircraft: "Cessna 172S",
    configuration: "Generic normal-category training profile",
    sourceNote: "Reference values are examples. Add the aircraft configuration and approved POH/AFM revision, then have an instructor review this profile before using it for a specific aircraft.",
    targets: {
      rotation: 55,
      climbMin: 70,
      climbMax: 80,
      safeFlapTarget: 60,
      approachMin: 60,
      approachMax: 70,
    },
    settings: {
      takeoffFlaps: 10,
      landingFlaps: 30,
    },
  },
  takeoff: {
    title: "Takeoff Checklist",
    label: "Before takeoff · Takeoff roll · Climb",
    verticalTarget: "Positive rate of climb",
    steps: [
      { name: "Parking brake", description: "Release parking brake when ready to taxi.", requires: "brake", control: "Parking Brake" },
      { name: "Flaps — takeoff setting", description: "Set the approved takeoff flap setting for this training profile.", requires: "flaps_takeoff", control: "Flaps" },
      { name: "Elevator trim", description: "Set elevator trim to the takeoff-marked position.", requires: "trim_takeoff", control: "Elevator Trim" },
      { name: "Mixture", description: "Set mixture for conditions and the approved aircraft checklist. This generic profile uses full rich.", requires: "engine_setup", control: "Mixture" },
      { name: "Lights · Strobes · Transponder", description: "Set exterior lights as required, strobes as appropriate, and the assigned transponder code and instructed mode.", requires: "lights_xpdr", control: "Light Switches + Transponder" },
      { name: "Takeoff power", description: "On the runway: throttle smoothly to full takeoff power.", requires: "throttle_full", control: "Throttle" },
      { name: "Engine indications", description: "Check engine indications and confirm takeoff power during the roll.", requires: "verify_takeoff", control: "Tachometer" },
      { name: "Centerline · Hold flap setting", description: "Maintain directional control with the rudder pedals. Hold the selected flap setting during the roll.", requires: "centreline", control: "Rudder Pedals" },
      { name: "Rotation", description: "At or above the profile reference speed, smoothly raise the nosewheel.", requires: "rotate", control: "Yoke" },
      { name: "Climb speed", description: "Confirm the recommended climb speed for the conditions.", requires: "climb_speed", control: "Airspeed" },
      { name: "Safe flap speed", description: "After obstacles are clear, confirm the profile reference before retracting takeoff flaps.", requires: "safe_flap_speed", control: "Airspeed" },
      { name: "Flaps — retract", description: "Retract takeoff flaps when clear of obstacles and at a safe speed.", requires: "flaps_up", control: "Flaps" },
      { name: "Trim for climb", description: "Adjust elevator trim as needed to maintain the climb attitude and speed.", requires: "trim_climb", control: "Elevator Trim" },
      { name: "Positive climb", description: "Confirm a positive rate of climb and continue with the aircraft's climb checks.", requires: "climb", control: "Yoke" },
    ],
  },
  landing: {
    title: "Landing Checklist",
    label: "Pattern · Approach · Touchdown · Rollout",
    verticalTarget: "Stabilized descent",
    steps: [
      { name: "Join pattern / approach", description: "Join the correct pattern or approach.", requires: "pattern", control: "VOR Nav" },
      { name: "Reduce power", description: "Reduce power for descent (throttle back).", requires: "throttle_reduce", control: "Throttle" },
      { name: "Landing flaps", description: "Configure flaps to the approved landing setting for this training profile.", requires: "flaps_landing", control: "Flaps" },
      { name: "Approach speed", description: "Stabilize in the profile reference range with the selected landing configuration; adjust for conditions.", requires: "vapp", control: "Airspeed" },
      { name: "Touchdown zone & idle", description: "Aim for the touchdown zone; reduce power to idle when appropriate.", requires: "idle", control: "Throttle" },
      { name: "Touch down mains", description: "Flare and touch down smoothly on main wheels.", requires: "touchdown", control: "Yoke" },
      { name: "Rollout", description: "Lower the nosewheel gently, maintain directional control, and brake as needed.", requires: "rollout", control: "Rudder Pedals" },
      { name: "Clear runway", description: "Taxi clear at the appropriate exit and verify the aircraft is clear of the runway.", requires: "clear", control: "Rudder Pedals" },
    ],
  },
};
