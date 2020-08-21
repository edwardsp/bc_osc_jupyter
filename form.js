'use strict'

/**
 * Clamp between two numbers
 *
 * @param      {number}  min     The minimum
 * @param      {number}  max     The maximum
 * @param      {number}  val     The value to clamp
 */
function clamp(min, max, val) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Simple helper to return the capitalized version of the
 * current select cluster (i.e., Owens and Pitzer).
 */
function current_cluster_capitalized(){
  var cluster = $('#batch_connect_session_context_cluster').val();
  return cluster.charAt(0).toUpperCase() + cluster.slice(1);
}

/**
 * Fix num cores, allowing blanks to remain
 */
function fix_num_cores() {
  let node_type_input = $('#batch_connect_session_context_node_type');
  let num_cores_input = $('#batch_connect_session_context_num_cores');

  if(num_cores_input.val() === '') {
    return;
  }

  set_ppn_by_node_type(node_type_input, num_cores_input);
}

/**
 * Sets the ppn by node type.
 *
 * @param      {element}  node_type_input  The node type input
 * @param      {element}  num_cores_input  The number cores input
 */
function set_ppn_by_node_type(node_type_input, num_cores_input) {
  const data = node_type_input.find(':selected').data();
  const cluster = current_cluster_capitalized();

  // classroom deployments don't have node_type_input
  if(!data){
    return;
  }

  const min = data["minPpn" + cluster];
  const max = data["maxPpn" + cluster];

  num_cores_input.attr('max', max);
  num_cores_input.attr('min', min);

  // Clamp value between min and max
  num_cores_input.val(
    clamp(min, max, num_cores_input.val())
  );
}

/**
 * Toggle the visibility of a form group
 *
 * @param      {string}    form_id  The form identifier
 * @param      {boolean}   show     Whether to show or hide
 */
function toggle_visibility_of_form_group(form_id, show) {
  let form_element = $(form_id);
  let parent = form_element.parent();

  // kick out if you didn't find what you're looking for
  if(parent.size() <= 0) {
    return;
  }

  if(show) {
    parent.show();
  } else {
    form_element.val('');
    parent.hide();
  }
}

/**
 * Update the cuda select options because not all options are available
 * on all clusters. So hide/show them as appropriate.
 */
function update_cuda_options() {
  const cluster = current_cluster_capitalized();
  const cuda_options = $('#batch_connect_session_context_cuda_version option');

  cuda_options.each(function(_i, option) {
    // the variable 'option' is just a data structure. it has no attr, data, show
    // or hide methods so we have to query for it again
    let option_element = $("#batch_connect_session_context_cuda_version option[value='" + option.value + "']");
    let data = option_element.data();
    let show = data["versionFor" + cluster];

    if(show) {
      option_element.show();
    } else {
      option_element.hide();
    }
  });
}

/**
 * Toggle the visibility of the CUDA select when the selected
 * node_type changes
 */
function toggle_cuda_version_visibility(selected_node_type) {
  const cuda_element = $('#batch_connect_session_context_cuda_version');
  const choose_gpu = selected_node_type == 'gpu';

  toggle_visibility_of_form_group(cuda_element, choose_gpu);
  if(choose_gpu){
    update_cuda_options();
  }
}

/**
 * Sets the change handler for the node_type select.
 */
function set_node_type_change_handler() {
  let node_type_input = $('#batch_connect_session_context_node_type');
  node_type_input.change((event) => node_type_change_handler(event));
}

/**
 * Sets the change handler for the node_type select.
 */
function set_cluster_change_handler() {
  let cluster_input = $('#batch_connect_session_context_cluster');
  cluster_input.change((event) => cluster_change_handler(event));
}

/**
 * Update UI when node_type changes
 */
function node_type_change_handler(event) {
  fix_num_cores();
  toggle_cuda_version_visibility(event.target.value);
}

/**
 * Update UI when node_type changes
 */
function cluster_change_handler(event) {
  fix_num_cores();
  update_cuda_options();
}

/**
 * Main
 */

// Set controls to align with the values of the last session context
fix_num_cores();
toggle_cuda_version_visibility(
  $('#batch_connect_session_context_node_type option:selected').val()
);

// Install event handlers
set_node_type_change_handler();
set_cluster_change_handler();