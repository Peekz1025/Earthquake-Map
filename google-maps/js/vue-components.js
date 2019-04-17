Vue.component('friend-list-row',{
	props: ['name','index'],
	template: `<tr>
			<td>{{ index + 1}}</td>
			<td v-text="name"></td>
		   </tr>`
});

Vue.component('friend-list',{
	props:['names', "title"],
	template: `<div>
			<h2>{{title}}</h2>
			<table class="pure-table-striped">
			  <thead><th>Guest #</th><th>Guest Name</th></thead>
			  <tr is="friend-list-row" v-for="(name,index) in names" v-bind:name="name" v-bind:index="index"></tr>
			</table>
		  </div>`
});